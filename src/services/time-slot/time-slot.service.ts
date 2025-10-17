import { inject, injectable } from "inversify";
import { BackendTimeSlot, ITimeSlotService } from "./time-slot.service.interface";
import {
  AvailableSlotsDTO,
  BlockSlotDTO,
  MultiDayBlockSlotDTO,
} from "../../dto/time-slot.dto";
import { TYPES } from "../../types/types";
import { IBookingRepository } from "../../repositories/booking/booking.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { BookingStatus } from "../../utils/booking-status.enum";

import { CalendarEvent, ICalendarProvider } from "../calendar/calender.provider.interface";

@injectable()
export class TimeSlotService implements ITimeSlotService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.ICalendarProvider) private _calendarProvider: ICalendarProvider // New injection
  ) {}

  // Remove private getCalendarClient() — no longer needed!

  private async validateTechnician(technicianId: string) {
    const technician = await this._userRepository.findUserById(technicianId);
    if (!technician || technician.role !== "partner" || !technician.email) {
      throw new Error("Technician not found or invalid");
    }
    return technician;
  }

  async checkSlotAvailability(data: { technicianId: string; startTime: Date; endTime: Date }) {
    // Unchanged — this uses booking repo, not calendar
    try {
      const existingBooking = await this._bookingRepository.findOneBooking({
        technicianId: data.technicianId,
        timeSlotStart: data.startTime,
        timeSlotEnd: data.endTime,
        bookingStatus: { $in: ['Hold', 'Confirmed'] },
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
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
    console.log("data", data);

    try {
      const technician = await this.validateTechnician(technicianId as string);

      const hasConflict = await this.hasOverlap(technician.email, new Date(start), new Date(end));
      if (hasConflict) {
        return { success: false, message: 'Slot already booked. Please choose another time. Money will be refunded within 3 working days. Contact CustomerCare for Support' };
      }

      const booking = await this._bookingRepository.findBookingByIdAndUpdateStatus(
        bookingId,
        'Hold',
        'Confirming'
      );

      if (!booking && isCustomerBooking === true) {
        return { success: false, message: 'Booking not found or already processed.' };
      }

      const summary = isCustomerBooking ? `Booked: ${reason}` : `Blocked: ${reason}`;
      const description = isCustomerBooking
        ? `Customer booking done for ${reason} works`
        : `Technician unavailability: ${reason}`;
      console.log("summary, description", summary, description);

      const event: CalendarEvent = { // Use your DTO
        summary,
        description,
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
            reason,
          },
        },
      };
      console.log("event", event);

      // NEW: Use provider instead of direct API
      const eventId = await this._calendarProvider.insertEvent(technician.email, event);

      await this._bookingRepository.updateBooking(bookingId, {
        bookingStatus: BookingStatus.CONFIRMED,
        googleEventId: eventId, // Still call it googleEventId for now; refactor if needed for multi-provider
      });

      return {
        success: true,
        message: "Slot blocked successfully",
        eventId,
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
    // NEW: Use provider's listEvents
    const events = await this._calendarProvider.listEvents(
      email,
      start.toISOString(),
      end.toISOString(),
      true, // singleEvents
      1 // maxResults: just need to check if any exist
    );
    return events.length > 0;
  }

  async blockMultiDaySlots(data: MultiDayBlockSlotDTO): Promise<{ success: boolean; message: string }> {
    const { technicianId, startDate, endDate, reason } = data;
    try {
      const technician = await this.validateTechnician(technicianId);
      // NEW: Build events array and insert via provider

      const currentDay = new Date(startDate);
      const endDay = new Date(endDate);
      endDay.setHours(23, 59, 59, 999);

      const eventsToInsert: Promise<string>[] = []; // Collect promises for event IDs if needed

      while (currentDay <= endDay) {
        const dayStart = new Date(currentDay);
        dayStart.setHours(9, 0, 0, 0);
        const dayEnd = new Date(currentDay);
        dayEnd.setHours(18, 0, 0, 0);

        const event: CalendarEvent = {
          summary: `Blocked: ${reason}`,
          description: `Technician unavailability: ${reason}`,
          start: { dateTime: dayStart.toISOString(), timeZone: "Asia/Kolkata" },
          end: { dateTime: dayEnd.toISOString(), timeZone: "Asia/Kolkata" },
          extendedProperties: {
            private: {
              type: "technicianBlock",
              reason,
            },
          },
        };

        eventsToInsert.push(
          this._calendarProvider.insertEvent(technician.email, event)
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

  async unblockSlot(technicianId: string, googleEventId: string): Promise<{ success: boolean; message: string }> {
    try {
      const technician = await this.validateTechnician(technicianId);
      // NEW: Use provider
      await this._calendarProvider.deleteEvent(technician.email, googleEventId);
      return { success: true, message: "Slot unblocked successfully" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in unblockSlot:", error);
      if (error.message.includes("404")) { // Provider throws with code info
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

  async getAvailableSlots(data: AvailableSlotsDTO): Promise<{ success: boolean; slots: BackendTimeSlot[] }> {
    const { technicianId, date } = data;

    try {
      const technician = await this.validateTechnician(technicianId);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(9, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(18, 0, 0, 0);

      // NEW: Use provider's listEvents
      const existingEvents = await this._calendarProvider.listEvents(
        technician.email,
        startOfDay.toISOString(),
        endOfDay.toISOString(),
        true, // singleEvents
        250 // Bump maxResults; your day has ~9 hours, but buffer for safety
      );

      console.log(`Fetched ${existingEvents.length} events from calendar for ${date}.`);

      // Rest unchanged: Generate slots, check overlaps, etc.
      const generatedHourlySlots: BackendTimeSlot[] = [];
      let currentTime = new Date(startOfDay);
      const now = new Date();

      while (currentTime < endOfDay) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime);
        slotEnd.setHours(currentTime.getHours() + 1);

        let slotType: BackendTimeSlot["type"] = "available";
        let googleEventId: string | undefined;
        let reason: string | undefined;

        const isPastOrSoonSlot = slotEnd.getTime() < now.getTime() + 60 * 60 * 1000;

        // Check for overlaps (now using existingEvents from provider)
        for (const event of existingEvents) {
          if (!event.start?.dateTime || !event.end?.dateTime) continue;

          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);

          const hasOverlap = slotStart < eventEnd && slotEnd > eventStart;

          if (hasOverlap) {
            const eventCustomType = event.extendedProperties.private.type;

            if (eventCustomType === "customerBooking") {
              slotType = "customer-booked";
              googleEventId = event.id;/* You'd need to add id to CalendarEvent if not already; for now, assume it's derivable or add it */
              reason = event.summary || "Customer Booking";
              break;
            } else if (eventCustomType === "technicianBlock") {
              slotType = "technician-blocked";
              googleEventId = event.id;
              reason = event.summary || "Technician Block";
            } else {
              slotType = "technician-blocked";
              googleEventId = event.id;
              reason = event.summary || "Busy (other event)";
            }
          }
        }

        const isAvailable = slotType === "available" && !isPastOrSoonSlot;
        const isEditable =
          (slotType === "available" || slotType === "technician-blocked") &&
          !isPastOrSoonSlot;

        generatedHourlySlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          type: slotType,
          isAvailable,
          isEditable,
          id: googleEventId,
          reason,
        });

        currentTime = slotEnd;
      }

      console.log("Total generated slots with types:", generatedHourlySlots.length);
      return { success: true, slots: generatedHourlySlots };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getAvailableSlots:", error);
      // Unchanged error handling
      if (error.message.includes("403")) {
        throw new Error("Calendar access denied. Check service account permissions.");
      } else if (error.message.includes("404")) {
        throw new Error("Calendar not found. Verify technician email and calendar access.");
      } else if (error.message?.includes("invalid_grant")) {
        throw new Error("Service account authentication failed. Check credentials.");
      }
      throw new Error(`Failed to get available slots: ${error.message || error}`);
    }
  }
}


