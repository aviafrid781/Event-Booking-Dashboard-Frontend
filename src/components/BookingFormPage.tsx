import { useState } from 'react';
import { createBooking, updateBooking } from '../api';
import type { Booking, EventDto } from '../types';

interface Props {
  events: EventDto[];
  /** When present, the form edits this booking instead of creating a new one. */
  booking?: Booking;
  onDone: () => void;
  onCancel: () => void;
}

/**
 * Full-page booking form used for both creating and editing.
 *
 * Create generates a fresh `requestId` per submission (the backend's idempotency
 * key). Edit PATCHes the customer/seat fields — the event can't be changed once
 * a booking exists, so it is shown read-only.
 */
export function BookingFormPage({ events, booking, onDone, onCancel }: Props) {
  const isEdit = Boolean(booking);

  const [eventId, setEventId] = useState<number | ''>(booking?.eventId ?? '');
  const [customerName, setName] = useState(booking?.customerName ?? '');
  const [customerEmail, setEmail] = useState(booking?.customerEmail ?? '');
  const [seats, setSeats] = useState(booking?.seats ?? 1);
  const [requestId] = useState(() => crypto.randomUUID());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isEdit && eventId === '') {
      setError('Please choose an event.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && booking) {
        await updateBooking(booking.id, { customerName, customerEmail, seats });
      } else {
        await createBooking({
          requestId,
          eventId: Number(eventId),
          customerName,
          customerEmail,
          seats,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking.');
    } finally {
      setSubmitting(false);
    }
  }

  const currentEvent = events.find((ev) => ev.id === booking?.eventId);

  return (
    <section>
      <button className="link-back" onClick={onCancel}>
        ← Back to bookings
      </button>
      <h2>{isEdit ? 'Edit booking' : 'Create a booking'}</h2>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="event">Event</label>
            {isEdit ? (
              <input
                id="event"
                value={currentEvent?.name ?? `#${booking?.eventId}`}
                disabled
              />
            ) : (
              <select
                id="event"
                value={eventId}
                onChange={(e) =>
                  setEventId(e.target.value === '' ? '' : Number(e.target.value))
                }
              >
                <option value="">Select an event…</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.remainingSeats} left)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="name">Customer name</label>
            <input
              id="name"
              value={customerName}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Customer email</label>
            <input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="seats">Seats</label>
            <input
              id="seats"
              type="number"
              min={1}
              max={50}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Book seats'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>

        {error && <div className="notice error">{error}</div>}
      </form>
    </section>
  );
}
