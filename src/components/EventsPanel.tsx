import { formatDhakaDate } from '../utils/date';
import type { EventDto } from '../types';

interface Props {
  events: EventDto[];
}

function formatDate(iso: string): string {
  return formatDhakaDate(iso);
}

/** Overview of events with their live remaining-seat counts (GET /events). */
export function EventsPanel({ events }: Props) {
  if (events.length === 0) {
    return (
      <section>
        <h2>Events</h2>
        <p className="muted">No events available yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Events</h2>
      <div className="events-grid">
        {events.map((ev) => {
          const pct =
            ev.totalSeats > 0
              ? Math.round((ev.remainingSeats / ev.totalSeats) * 100)
              : 0;
          const soldOut = ev.remainingSeats <= 0;
          const low = !soldOut && pct <= 15;
          const level = soldOut ? 'sold-out' : low ? 'low' : 'ok';

          return (
            <div key={ev.id} className="event-card">
              <div className="event-card-head">
                <h3>{ev.name}</h3>
                <span className="event-price">
                  {Number(ev.price) === 0
                    ? 'Free'
                    : `$${Number(ev.price).toFixed(2)}`}
                </span>
              </div>

              <div className="muted event-date">{formatDate(ev.date)}</div>

              <div className="seat-meter">
                <div
                  className={`seat-meter-fill ${level}`}
                  style={{ width: `${Math.max(pct, soldOut ? 100 : 4)}%` }}
                />
              </div>

              <div className="event-seats">
                {soldOut ? (
                  <span className="seat-tag sold-out">Sold out</span>
                ) : (
                  <span className={`seat-tag ${level}`}>
                    {ev.remainingSeats} of {ev.totalSeats} seats left
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
