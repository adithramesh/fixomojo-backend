export interface CalendarEvent {
    id?: string;
    summary:string,
    description:string,
    start:{
        dateTime:string,
        timeZone:string
    },
    end:{
        dateTime:string,
        timeZone:string
    },
    extendedProperties:{
        private:{
            type:string,
            reason:string
        }
    }
}

export interface ICalendarProvider {
    insertEvent(calendarId:string, eventData:CalendarEvent):Promise<string>
    deleteEvent(calendarId:string, eventId:string):Promise<void>
    listEvents( calendarId:string, timeMin:string, timeMax:string, singleEvents:boolean, maxResults:number ):Promise<CalendarEvent[]>
}