import { google } from "googleapis";
import { CalendarEvent, ICalendarProvider } from "./calender.provider.interface";
import config from "../../config/env";

export class GoogleCalendarProvider implements ICalendarProvider {
  private async getCalendarClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: config.GOOGLE_CALENDAR_SCOPES,
    });
    return google.calendar({ version: "v3", auth });
  }

  async insertEvent(calendarId: string, eventData: CalendarEvent): Promise<string> {
    try {
      const calendar = await this.getCalendarClient();
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventData, 
      });
      return response.data.id!; // Return event ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error inserting event:", error);
      throw new Error(`Failed to insert event: ${error.message}`);
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      const calendar = await this.getCalendarClient();
      await calendar.events.delete({
        calendarId,
        eventId,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting event:", error);
      if (error.code === 404) {
        throw new Error("Event not found or already deleted.");
      }
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async listEvents(
    calendarId: string,
    timeMin: string,
    timeMax: string,
    singleEvents: boolean,
    maxResults: number
  ): Promise<CalendarEvent[]> {
    try {
      const calendar = await this.getCalendarClient();
      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents,
        maxResults,
        orderBy: "startTime", // Bonus: Add this for consistent ordering, like in your original
        timeZone: "Asia/Kolkata", // Match your original
      });

      // Map Google's response to your CalendarEvent[] (filter out nulls, pick needed fields)
      return (response.data.items || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item): item is any => !!item.start?.dateTime && !!item.end?.dateTime) // Ensure valid events
        .map((item): CalendarEvent => ({
          id: item.id,
          summary: item.summary || "",
          description: item.description || "",
          start: {
            dateTime: item.start.dateTime!,
            timeZone: "Asia/Kolkata", // Default to your TZ
          },
          end: {
            dateTime: item.end.dateTime!,
            timeZone: "Asia/Kolkata",
          },
          extendedProperties: {
            private: {
              type: item.extendedProperties?.private?.type || "",
              reason: item.extendedProperties?.private?.reason || "",
            },
          },
        }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error listing events:", error);
      throw new Error(`Failed to list events: ${error.message}`);
    }
  }
}