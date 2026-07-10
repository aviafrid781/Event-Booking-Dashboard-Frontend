import { useCallback, useEffect, useState } from 'react';
import { deleteBooking, getBooking } from '../api';
import type { Booking } from '../types';

interface Props {
  id: number;
  onBack: () => void;
  onEdit: (booking: Booking) => void;
  onDeleted: () => void;
}

/** Read-only details for a single booking, with edit/delete actions. */
export function BookingDetailsPage({ id, onBack, onEdit, onDeleted }: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBooking(await getBooking(id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <button className="link-back" onClick={onBack}>
        ← Back to bookings
      </button>
      <h2>Booking details</h2>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="notice error">{error}</div>}

      {booking && (
        <div className="card">
          <dl className="detail-grid">
            <dt>Reference</dt>
            <dd className="ref">{booking.reference}</dd>

            <dt>Status</dt>
            <dd>
              <span className={`badge ${booking.status}`}>{booking.status}</span>
              {booking.status === 'FAILED' && booking.failureReason && (
                <span className="muted"> — {booking.failureReason}</span>
              )}
            </dd>

            <dt>Event</dt>
            <dd>{booking.event?.name ?? `#${booking.eventId}`}</dd>

            <dt>Customer</dt>
            <dd>{booking.customerName}</dd>

            <dt>Email</dt>
            <dd>{booking.customerEmail}</dd>

            <dt>Seats</dt>
            <dd>{booking.seats}</dd>

            <dt>Created</dt>
            <dd>{new Date(booking.createdAt).toLocaleString()}</dd>
          </dl>

          <div className="form-actions">
            <button onClick={() => onEdit(booking)}>✏️ Edit</button>
            <button
              className="secondary"
              onClick={async () => {
                if (
                  !window.confirm(
                    `Delete booking ${booking.reference.slice(0, 8)}… for ${booking.customerName}?`,
                  )
                ) {
                  return;
                }
                try {
                  await deleteBooking(booking.id);
                  onDeleted();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to delete booking.');
                }
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
