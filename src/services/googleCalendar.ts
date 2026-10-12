import { getAccessToken } from './firebase';

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO string e.g. 2026-10-12T10:00:00Z
  endDateTime: string;   // ISO string
  location?: string;
  colorId?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export const GoogleCalendarService = {
  async createStudyEvent(event: CalendarEventPayload): Promise<GoogleCalendarEvent> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Conecte sua conta Google para sincronizar com o Google Calendar.');
    }

    const body = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Falha ao criar evento no Google Calendar: ${err}`);
    }

    return await response.json();
  },

  async listStudyEvents(): Promise<GoogleCalendarEvent[]> {
    const token = await getAccessToken();
    if (!token) return [];

    const now = new Date().toISOString();
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('timeMin', now);
    url.searchParams.set('maxResults', '25');
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('q', '[FocoConcurso]');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.warn('Could not fetch calendar events');
      return [];
    }

    const data = await response.json();
    return data.items || [];
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const token = await getAccessToken();
    if (!token) return false;

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.ok;
  }
};
