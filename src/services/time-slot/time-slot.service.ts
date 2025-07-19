import { google } from "googleapis";
import { inject, injectable } from "inversify";
import { BackendTimeSlot, ITimeSlotService } from "./time-slot.service.interface";
import {
  AvailableSlotsDTO,
  BlockSlotDTO,
  MultiDayBlockSlotDTO,
} from "../../dto/time-slot.dto";
import config from "../../config/env";
import { TYPES } from "../../types/types";
import { IBookingRepository } from "../../repositories/booking/booking.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";

@injectable()
export class TimeSlotService implements ITimeSlotService {
 
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IBookingRepository) private _bookingRepository:IBookingRepository
  ) {}

  private async getCalendarClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    return google.calendar({ version: "v3", auth });
  }

  private async validateTechnician(technicianId: string) {
    const technician = await this._userRepository.findUserById(technicianId);
    if (!technician || technician.role !== "partner" || !technician.email) {
      throw new Error("Technician not found or invalid");
    }
    return technician;
  }


   async checkSlotAvailability(data: { technicianId: string; startTime: Date; endTime: Date }) {
    try {
      const existingBooking = await this._bookingRepository.findOneBooking({
        technicianId: data.technicianId,
        timeSlotStart: data.startTime,
        timeSlotEnd: data.endTime,
        bookingStatus: { $in: ['Hold', 'Confirmed'] },
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }, // Only recent Holds
      });

      return {
        success: !existingBooking,
        message: existingBooking ? 'Slot unavailable' : 'Slot available',
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return { success: false, message: `Error checking slot: ${error.message}` };
    }
  }

   async blockSlot(data: BlockSlotDTO): Promise<{ success: boolean; message: string; eventId?: string | null }> {
    const { technicianId, start, end, reason, isCustomerBooking, bookingId } = data;
    console.log("data",data);
    
    try {
      const technician = await this.validateTechnician(technicianId as string);
      const calendar = await this.getCalendarClient();

      const hasConflict = await this.hasOverlap(technician.email, new Date(start), new Date(end));
        if (hasConflict) {
          return { success: false, message: 'Slot already booked. Please choose another time. Money will be refunded within 3 working days. Contact CustomerCare for Support' };
        }
      
      const booking = await this._bookingRepository.findBookingByIdAndUpdateStatus(
      bookingId,
      'Hold',
      'Confirming' 
      );

      if (!booking && isCustomerBooking===true) {
        return { success: false, message: 'Booking not found or already processed.' };
      }
      // Define event summary and description based on booking type
      const summary = isCustomerBooking
        ? `Booked: ${reason}`
        : `Blocked: ${reason}`;
      const description = isCustomerBooking
        ? `Customer booking done for ${reason} works`
        : `Technician unavailability: ${reason}`;
        console.log("summary, description", summary, description);
        
      const event = {
        summary: summary,
        description: description,
        start: {
          dateTime: new Date(start).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: new Date(end).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        extendedProperties: {
          private: {
            type: isCustomerBooking ? "customerBooking" : "technicianBlock",
            reason: reason, // Store reason for easier retrieval if needed
          },
        },
      };
      console.log("event", event);
      
      const calendarResponse = await calendar.events.insert({
        calendarId: technician.email,
        requestBody: event,
      });

      await this._bookingRepository.updateBooking(bookingId, {
        bookingStatus: 'Confirmed',
        googleEventId: calendarResponse.data.id!
      });

      return {
        success: true,
        message: "Slot blocked successfully",
        eventId: calendarResponse.data.id,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in blockSlot:", error);
      return {
        success: false,
        message: `Failed to block slot: ${error.message || error}`,
      };
    }
  }

  private async hasOverlap(email: string, start: Date, end: Date): Promise<boolean> {
    const calendar = await this.getCalendarClient();
    const result = await calendar.events.list({
      calendarId: email,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      maxResults: 1
    });

    return (result.data.items?.length ?? 0) > 0;
  }


  async blockMultiDaySlots(data: MultiDayBlockSlotDTO): Promise<{ success: boolean; message: string }> {
    const { technicianId, startDate, endDate, reason } = data;
    try {
      const technician = await this.validateTechnician(technicianId);
      const calendar = await this.getCalendarClient();

      const currentDay = new Date(startDate);
      const endDay = new Date(endDate);
      endDay.setHours(23, 59, 59, 999);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventsToInsert: Promise<any>[] = [];

      while (currentDay <= endDay) {
        const dayStart = new Date(currentDay);
        dayStart.setHours(9, 0, 0, 0);
        const dayEnd = new Date(currentDay);
        dayEnd.setHours(18, 0, 0, 0);

        const event = {
          summary: `Blocked: ${reason}`,
          description: `Technician unavailability: ${reason}`,
          start: { dateTime: dayStart.toISOString(), timeZone: "Asia/Kolkata" },
          end: { dateTime: dayEnd.toISOString(), timeZone: "Asia/Kolkata" },
          extendedProperties: {
            private: {
              type: "technicianBlock",
              reason: reason,
            },
          },
        };

        eventsToInsert.push(
          calendar.events.insert({
            calendarId: technician.email,
            requestBody: event,
          })
        );
        currentDay.setDate(currentDay.getDate() + 1);
      }

      await Promise.all(eventsToInsert);

      return {
        success: true,
        message: `Successfully blocked ${eventsToInsert.length} day(s).`,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in blockMultiDaySlots:", error);
      return {
        success: false,
        message: `Failed to block multiple days: ${error.message || error}`,
      };
    }
  }

  async unblockSlot(technicianId: string,googleEventId: string): Promise<{ success: boolean; message: string }> {
    try {
      const technician = await this.validateTechnician(technicianId);
      const calendar = await this.getCalendarClient();

      // Optional: Before deleting, verify the event belongs to technician and is a 'technicianBlock'
      // This prevents accidental deletion of customer bookings or other events.
      // const event = await calendar.events.get({ calendarId: technician.email, eventId: googleEventId });
      // if (event.data.extendedProperties?.private?.type !== 'technicianBlock') {
      //     throw new Error('Cannot unblock this event type. Only technician blocks are editable.');
      // }

      await calendar.events.delete({
        calendarId: technician.email,
        eventId: googleEventId,
      });

      return { success: true, message: "Slot unblocked successfully" };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in unblockSlot:", error);
      // Handle specific Google API errors, e.g., 404 if event not found
      if (error.code === 404) {
        return {
          success: false,
          message: "Failed to unblock: Event not found or already deleted.",
        };
      }
      return {
        success: false,
        message: `Failed to unblock slot: ${error.message || error}`,
      };
    }
  }

  async getAvailableSlots( data: AvailableSlotsDTO): Promise<{ success: boolean; slots: BackendTimeSlot[] }> {
    const { technicianId, date } = data;

    try {
      const technician = await this.validateTechnician(technicianId);
      const calendar = await this.getCalendarClient();

      const startOfDay = new Date(date);
      startOfDay.setHours(9, 0, 0, 0); // 9 AM
      const endOfDay = new Date(date);
      endOfDay.setHours(18, 0, 0, 0); // 6 PM

      // Step 1: Fetch all events for the day
      const eventsResponse = await calendar.events.list({
        calendarId: technician.email,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true, // Expand recurring events
        orderBy: "startTime",
        timeZone: "Asia/Kolkata",
        // fields: 'items(id,summary,description,start,end,extendedProperties)' // Request specific fields for efficiency
      });

      const existingEvents = eventsResponse.data.items || [];
      console.log(
        `Fetched ${existingEvents.length} events from Google Calendar for ${date}.`
      );

      const generatedHourlySlots: BackendTimeSlot[] = [];
      let currentTime = new Date(startOfDay);
      const now = new Date(); // Current time for "past slot" check

      while (currentTime < endOfDay) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime);
        slotEnd.setHours(currentTime.getHours() + 1);

        let slotType: BackendTimeSlot["type"] = "available";
        let googleEventId: string | undefined;
        let reason: string | undefined;

        // Determine if the slot is in the past relative to current time
        // For current day, consider anything within the next hour as effectively "past" for booking/blocking
        const isPastOrSoonSlot =
          slotEnd.getTime() < now.getTime() + 60 * 60 * 1000; // Ends within next 1 hour

        // Check for overlaps with existing events
        for (const event of existingEvents) {
          if (!event.start?.dateTime || !event.end?.dateTime || !event.id)
            continue;

          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);

          // Overlap check: slot overlaps if it starts before event ends AND ends after event starts
          const hasOverlap = slotStart < eventEnd && slotEnd > eventStart;

          if (hasOverlap) {
            // Extract custom type from extended properties
            const eventCustomType = event.extendedProperties?.private?.type;

            if (eventCustomType === "customerBooking") {
              slotType = "customer-booked";
              googleEventId = event.id;
              reason = event.summary || "Customer Booking";
              break; // Customer booking takes highest precedence, no need to check other overlaps
            } else if (eventCustomType === "technicianBlock") {
              // If it's a technician block, update type and capture details
              // Only update if not already marked as customer-booked (due to break above)
              slotType = "technician-blocked";
              googleEventId = event.id;
              reason = event.summary || "Technician Block";
              // Do not break here if you want to consider if a technician block is actually overlapped by a customer booking
              // However, with the 'customerBooking' check first, it's fine.
            } else {
              // Default handling for other calendar events (e.g., personal appointments without custom type)
              // Treat them as technician-blocked, but not explicitly editable by this system
              slotType = "technician-blocked"; // Or 'busy' if you want a fourth type
              googleEventId = event.id;
              reason = event.summary || "Busy (other event)";
            }
          }
        }

        // Determine final availability and editability based on type and time
        const isAvailable = slotType === "available" && !isPastOrSoonSlot;
        const isEditable =
          (slotType === "available" || slotType === "technician-blocked") &&
          !isPastOrSoonSlot;

        generatedHourlySlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          type: slotType,
          isAvailable: isAvailable,
          isEditable: isEditable,
          id: googleEventId, // This is the Google Calendar event ID
          reason: reason,
        });

        currentTime = slotEnd; // Move to the next hour
      }

      console.log(
        "Total generated slots with types:",
        generatedHourlySlots.length
      );
      return { success: true, slots: generatedHourlySlots };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getAvailableSlots:", error);

      // Provide more specific error information
      if (error.code === 403) {
        throw new Error(
          "Calendar access denied. Check service account permissions."
        );
      } else if (error.code === 404) {
        throw new Error(
          "Calendar not found. Verify technician email and calendar access."
        );
      } else if (error.message?.includes("invalid_grant")) {
        throw new Error(
          "Service account authentication failed. Check credentials."
        );
      }

      throw new Error(
        `Failed to get available slots: ${error.message || error}`
      );
    }
  }
}
