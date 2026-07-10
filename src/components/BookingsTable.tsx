import type { Booking } from '../types';

interface Props {
  bookings: Booking[];
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

/** Table of bookings with per-row view / edit / delete actions. */
export function BookingsTable({ bookings, onView, onEdit, onDelete }: Props) {
  if (bookings.length === 0) {
    return <p className="muted">No bookings match the current filters.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Event</th>
          <th>Customer</th>
          <th>Seats</th>
          <th>Status</th>
          <th className="actions-col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id}>
            <td className="ref" title={b.reference}>
              {b.reference.slice(0, 8)}…
            </td>
            <td>{b.event?.name ?? `#${b.eventId}`}</td>
            <td>
              {b.customerName}
              <br />
              <span className="muted" style={{ fontSize: '0.78rem' }}>
                {b.customerEmail}
              </span>
            </td>
            <td>{b.seats}</td>
            <td>
              <span className={`badge ${b.status}`}>{b.status}</span>
              {b.status === 'FAILED' && b.failureReason && (
                <div className="muted" style={{ fontSize: '0.72rem' }}>
                  {b.failureReason}
                </div>
              )}
            </td>
            <td className="actions-col">
              <div className="actions">
                <button
                  className="icon-btn"
                  title="View details"
                  aria-label="View details"
                  onClick={() => onView(b)}
                >
                  👁️
                </button>
                <button
                  className="icon-btn"
                  title="Edit booking"
                  aria-label="Edit booking"
                  onClick={() => onEdit(b)}
                >
                  ✏️
                </button>
                <button
                  className="icon-btn"
                  title="Delete booking"
                  aria-label="Delete booking"
                  onClick={() => onDelete(b)}
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
