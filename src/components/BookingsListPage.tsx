import { useCallback, useEffect, useState } from 'react';
import { deleteBooking, getBookings } from '../api';
import { BookingsTable } from './BookingsTable';
import type { Booking, BookingStatus, EventDto } from '../types';

const STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'FAILED'];
const PAGE_SIZE = 10;
const POLL_MS = 4000;

interface Props {
  events: EventDto[];
  onNew: () => void;
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
}

/** The dashboard list: filters, the bookings table, and pagination. */
export function BookingsListPage({ events, onNew, onView, onEdit }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [eventId, setEventId] = useState<number | ''>('');
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(
    async (opts: { showSpinner?: boolean } = {}) => {
      if (opts.showSpinner) setLoading(true);
      try {
        const res = await getBookings({
          eventId: eventId === '' ? undefined : eventId,
          status: status === '' ? undefined : status,
          page,
          limit: PAGE_SIZE,
        });
        setBookings(res.data);
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings.');
      } finally {
        if (opts.showSpinner) setLoading(false);
      }
    },
    [eventId, status, page],
  );

  // Reload (with spinner) whenever a filter or page changes.
  useEffect(() => {
    loadBookings({ showSpinner: true });
  }, [loadBookings]);

  // Poll in the background so PENDING → CONFIRMED/FAILED transitions appear
  // without a manual refresh.
  useEffect(() => {
    const id = setInterval(() => loadBookings(), POLL_MS);
    return () => clearInterval(id);
  }, [loadBookings]);

  async function handleDelete(booking: Booking) {
    const ok = window.confirm(
      `Delete booking ${booking.reference.slice(0, 8)}… for ${booking.customerName}?`,
    );
    if (!ok) return;
    try {
      await deleteBooking(booking.id);
      await loadBookings({ showSpinner: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking.');
    }
  }

  return (
    <section>
      <div className="section-head">
        <h2>Bookings</h2>
        <button onClick={onNew}>+ New booking</button>
      </div>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="filter-event">Filter by event</label>
          <select
            id="filter-event"
            value={eventId}
            onChange={(e) => {
              setPage(1);
              setEventId(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">All events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-status">Filter by status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as BookingStatus | '');
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="spacer" />

        <button className="secondary" onClick={() => loadBookings({ showSpinner: true })}>
          Refresh
        </button>
      </div>

      {error && <div className="notice error">{error}</div>}

      {loading ? (
        <p className="muted">Loading bookings…</p>
      ) : (
        <>
          <BookingsTable
            bookings={bookings}
            onView={onView}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
          <div className="pagination">
            <button
              className="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <span className="muted">
              Page {page} of {totalPages || 1} · {total} total
            </span>
            <button
              className="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
