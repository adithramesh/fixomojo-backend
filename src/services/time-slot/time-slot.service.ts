// import { calendar_v3, google } from 'googleapis';
// import { inject, injectable } from "inversify";
// import { ITimeSlotService } from "./time-slot.service.interface";
// import { AvailableSlotsDTO, BlockSlotDTO } from "../../dto/time-slot.dto";
// import config from "../../config/env";
// import { UserRepository } from '../../repositories/user/user.repository';
// import { TYPES } from '../../types/types';

// @injectable()
// export class TimeSlotService implements ITimeSlotService{
//      constructor(
//         @inject(TYPES.UserRepository) private _userRepository: UserRepository,
//      ){}
//    private async getCalendarClient() {
//         const auth = new google.auth.GoogleAuth({
//             keyFile: config.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
//             scopes: ['https://www.googleapis.com/auth/calendar'],
//         });
//         return google.calendar({ version: 'v3', auth });
//     }
   
//     async blockSlot(data: BlockSlotDTO): Promise<{ success: boolean; message: string; eventId?: string|null; }> {
//        const {technicianId,start, end,reason}=data
//       const technician = await this._userRepository.findUserById(technicianId)
//       if(!technician || technician.role!=='partner' || !technician.email){
//         return { success: false, message: 'Technician not found or invalid' };
//       }

//       // Create an "Unavailable" event in Google Calendar
//         const calendar = await this.getCalendarClient();
//         const event = {
//             summary: 'Unavailable',
//             description: `Blocked by technician: ${reason}`,
//             start: { dateTime: start.toISOString(), timeZone: 'Asia/Kolkata' },
//             end: { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' },
//         };

//         try {
//             const response = await calendar.events.insert({
//                 calendarId: technician.email,
//                 requestBody: event,
//             });
//             return { success: true, message: 'Slot blocked successfully', eventId:response.data.id };
//         } catch (error) {
//             return { success: false, message: `Failed to block slot: ${error}` };
//         }
//    }

// async getAvailableSlots(data: AvailableSlotsDTO): Promise<{ start: Date; end: Date; }[]> {
//     const { technicianId, date } = data;
//     console.log("data inside timeslot service", data);
    
//     const technician = await this._userRepository.findUserById(technicianId);
//     if (!technician || technician.role !== 'partner' || !technician.email) {
//         console.log("technician", technician);
        
//         throw new Error('Technician not found or invalid');
//     }

//     // Define the date range for the given day (e.g., 9 AM to 6 PM)
//     const startOfDay = new Date(date);
//     startOfDay.setHours(9, 0, 0, 0); // 9 AM
//     const endOfDay = new Date(date);
//     endOfDay.setHours(18, 0, 0, 0); // 6 PM

//     const calendar = await this.getCalendarClient();
//     console.log("calendar", calendar);
    
//     const busyResponse = await calendar.freebusy.query({
//         requestBody: {
//             timeMin: startOfDay.toISOString(),
//             timeMax: endOfDay.toISOString(),
//             timeZone: 'Asia/Kolkata',
//             items: [{ id: technician.email }],
//         },
        
//     });
   
//     console.log("busyResponse", busyResponse);

//     const busySlots: calendar_v3.Schema$TimePeriod[] = busyResponse.data.calendars?.[technician.email]?.busy || [];
//     console.log("busySlots", busySlots);
//     const availableSlots: { start: Date; end: Date }[] = [];
//     let currentTime = new Date(startOfDay);

//     while (currentTime < endOfDay) {
//         const slotEnd = new Date(currentTime);
//         slotEnd.setHours(currentTime.getHours() + 1);
//         console.log("inside while loop");
        
//         // Check if the slot is free
//         const isBusy = busySlots.some(
//             // Use the correct type from googleapis: calendar_v3.Schema$TimePeriod
//             (busy: calendar_v3.Schema$TimePeriod) => {
//                 // Add checks to ensure start and end are strings before using them
//                 if (busy.start && busy.end) {
//                     return new Date(busy.start) < slotEnd && new Date(busy.end) > currentTime;
//                 }
//                 return false; // If start or end is null/undefined, treat it as not busy for this check.
//             }
//         );

//         if (!isBusy) {
//             availableSlots.push({
//                 start: new Date(currentTime),
//                 end: slotEnd,
//             });
//         }

//         currentTime = slotEnd;
//     }
//     console.log("availableSlots", availableSlots);
    
//     return availableSlots;
// }
// }


import { calendar_v3, google } from 'googleapis';
import { inject, injectable } from "inversify";
import { ITimeSlotService } from "./time-slot.service.interface";
import { AvailableSlotsDTO, BlockSlotDTO } from "../../dto/time-slot.dto";
import config from "../../config/env";
import { UserRepository } from '../../repositories/user/user.repository';
import { TYPES } from '../../types/types';

@injectable()
export class TimeSlotService implements ITimeSlotService{
     constructor(
        @inject(TYPES.UserRepository) private _userRepository: UserRepository,
     ){}
   
   private async getCalendarClient() {
        const auth = new google.auth.GoogleAuth({
            keyFile: config.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        return google.calendar({ version: 'v3', auth });
    }
   
    async blockSlot(data: BlockSlotDTO): Promise<{ success: boolean; message: string; eventId?: string|null; }> {
       const {technicianId,start, end,reason}=data
      const technician = await this._userRepository.findUserById(technicianId)
      if(!technician || technician.role!=='partner' || !technician.email){
        return { success: false, message: 'Technician not found or invalid' };
      }

      // Create an "Unavailable" event in Google Calendar
        const calendar = await this.getCalendarClient();
        const event = {
            summary: 'Unavailable',
            description: `Blocked by technician: ${reason}`,
            start: { dateTime: start.toISOString(), timeZone: 'Asia/Kolkata' },
            end: { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' },
        };

        try {
            const response = await calendar.events.insert({
                calendarId: technician.email,
                requestBody: event,
            });
            return { success: true, message: 'Slot blocked successfully', eventId:response.data.id };
        } catch (error) {
            return { success: false, message: `Failed to block slot: ${error}` };
        }
   }

async getAvailableSlots(data: AvailableSlotsDTO): Promise<{ start: Date; end: Date; }[]> {
    const { technicianId, date } = data;
    console.log("data inside timeslot service", data);
    
    try {
        // Step 1: Validate technician
        const technician = await this._userRepository.findUserById(technicianId);
        if (!technician || technician.role !== 'partner' || !technician.email) {
            console.log("technician validation failed:", technician);
            throw new Error('Technician not found or invalid');
        }
        console.log("technician found:", technician.email);

        // Step 2: Define working hours
        const startOfDay = new Date(date);
        startOfDay.setHours(9, 0, 0, 0); // 9 AM
        const endOfDay = new Date(date);
        endOfDay.setHours(18, 0, 0, 0); // 6 PM
        
        console.log("Working hours:", {
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString()
        });

        // Step 3: Get calendar client
        const calendar = await this.getCalendarClient();
        console.log("calendar client created successfully");
        
        // Step 4: Query busy slots
        console.log("querying freebusy for:", technician.email);
        const busyResponse = await calendar.freebusy.query({
            requestBody: {
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                timeZone: 'Asia/Kolkata',
                items: [{ id: technician.email }],
            },
        });
        
        console.log("freebusy response:", JSON.stringify(busyResponse.data, null, 2));

        // Step 5: Extract busy slots
        const calendars = busyResponse.data.calendars;
        if (!calendars || !calendars[technician.email]) {
            console.log("No calendar data found for technician");
            // If no calendar data, assume all slots are available
            return this.generateAllSlots(startOfDay, endOfDay);
        }

        const busySlots: calendar_v3.Schema$TimePeriod[] = calendars[technician.email].busy || [];
        console.log("busy slots found:", busySlots.length);
        
        // Step 6: Generate available slots
        const availableSlots: { start: Date; end: Date }[] = [];
        let currentTime = new Date(startOfDay);

        while (currentTime < endOfDay) {
            const slotEnd = new Date(currentTime);
            slotEnd.setHours(currentTime.getHours() + 1);
            
            // Check if this slot conflicts with any busy period
            const isBusy = busySlots.some((busy: calendar_v3.Schema$TimePeriod) => {
                if (!busy.start || !busy.end) {
                    console.log("Invalid busy slot (missing start/end):", busy);
                    return false;
                }
                
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                
                // Check for overlap: slot overlaps if it starts before busy ends and ends after busy starts
                const hasOverlap = currentTime < busyEnd && slotEnd > busyStart;
                
                if (hasOverlap) {
                    console.log(`Slot ${currentTime.toISOString()} - ${slotEnd.toISOString()} conflicts with busy period ${busyStart.toISOString()} - ${busyEnd.toISOString()}`);
                }
                
                return hasOverlap;
            });

            if (!isBusy) {
                availableSlots.push({
                    start: new Date(currentTime),
                    end: new Date(slotEnd),
                });
                console.log(`Available slot: ${currentTime.toISOString()} - ${slotEnd.toISOString()}`);
            }

            // Move to next hour
            currentTime = new Date(slotEnd);
        }
        
        console.log("Total available slots found:", availableSlots.length);
        return availableSlots;
        
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
        console.error("Error in getAvailableSlots:", error);
        
        // Provide more specific error information
        if (error.code === 403) {
            throw new Error("Calendar access denied. Check service account permissions.");
        } else if (error.code === 404) {
            throw new Error("Calendar not found. Verify technician email and calendar access.");
        } else if (error.message?.includes('invalid_grant')) {
            throw new Error("Service account authentication failed. Check credentials.");
        }
        
        throw new Error(`Failed to get available slots: ${error.message || error}`);
    }
}

// Helper method to generate all possible slots when no busy data is available
private generateAllSlots(startOfDay: Date, endOfDay: Date): { start: Date; end: Date }[] {
    const availableSlots: { start: Date; end: Date }[] = [];
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
        const slotEnd = new Date(currentTime);
        slotEnd.setHours(currentTime.getHours() + 1);
        
        availableSlots.push({
            start: new Date(currentTime),
            end: new Date(slotEnd),
        });
        
        currentTime = new Date(slotEnd);
    }
    
    console.log("Generated all slots (no busy data):", availableSlots.length);
    return availableSlots;
}
}