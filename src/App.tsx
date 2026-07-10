import { useCallback, useEffect, useState } from 'react';
import { getEvents } from './api';
import { BookingsListPage } from './components/BookingsListPage';
import { BookingFormPage } from './components/BookingFormPage';
import { BookingDetailsPage } from './components/BookingDetailsPage';
import { EventsPanel } from './components/EventsPanel';
import type { Booking, EventDto } from './types';

const EVENTS_POLL_MS = 4000;

/**
 * Which "page" is showing. This is a tiny client-side router kept in state so
 * the app stays dependency-free — the form and details views replace the list,
 * just like navigating to another page.
 */
type View =
  | { name: 'list' }
  | { name: 'new' }
  | { name: 'edit'; booking: Booking }
  | { name: 'view'; id: number };

export function App() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [view, setView] = useState<View>({ name: 'list' });

  const loadEvents = useCallback(async () => {
    try {
      setEvents(await getEvents());
    } catch {
      /* the list page surfaces fetch errors; keep the header quiet */
    }
  }, []);

  useEffect(() => {
    loadEvents();
    const id = setInterval(loadEvents, EVENTS_POLL_MS);
    return () => clearInterval(id);
  }, [loadEvents]);

  const goList = useCallback(() => setView({ name: 'list' }), []);

  return (
    <div className="container">
      <h1>Event Booking Dashboard</h1>
      <p className="subtitle">
        Bookings are processed asynchronously — new ones start as{' '}
        <span className="badge PENDING">PENDING</span> and update automatically.
      </p>

      {view.name === 'list' && (
        <>
          <EventsPanel events={events} />
          <BookingsListPage
            events={events}
            onNew={() => setView({ name: 'new' })}
            onView={(booking) => setView({ name: 'view', id: booking.id })}
            onEdit={(booking) => setView({ name: 'edit', booking })}
          />
        </>
      )}

      {view.name === 'new' && (
        <BookingFormPage
          events={events}
          onDone={goList}
          onCancel={goList}
        />
      )}

      {view.name === 'edit' && (
        <BookingFormPage
          events={events}
          booking={view.booking}
          onDone={goList}
          onCancel={goList}
        />
      )}

      {view.name === 'view' && (
        <BookingDetailsPage
          id={view.id}
          onBack={goList}
          onEdit={(booking) => setView({ name: 'edit', booking })}
          onDeleted={goList}
        />
      )}
    </div>
  );
}
