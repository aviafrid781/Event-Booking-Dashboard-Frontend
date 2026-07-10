import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
  EventDto,
  Paginated,
  UpdateBookingInput,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    // NestJS validation errors come back as { message: string | string[] }.
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message ?? detail;
    } catch {
      /* non-JSON error body — keep statusText */
    }
    throw new Error(detail);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export function getEvents(): Promise<EventDto[]> {
  return request<EventDto[]>('/events');
}

export interface BookingFilters {
  eventId?: number;
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

export function getBookings(
  filters: BookingFilters,
): Promise<Paginated<Booking>> {
  const params = new URLSearchParams();
  if (filters.eventId) params.set('eventId', String(filters.eventId));
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return request<Paginated<Booking>>(`/bookings${qs ? `?${qs}` : ''}`);
}

export interface CreateBookingResponse {
  reference: string;
  status: BookingStatus;
  message: string;
}

export function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResponse> {
  return request<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getBooking(id: number): Promise<Booking> {
  return request<Booking>(`/bookings/${id}`);
}

export function updateBooking(
  id: number,
  input: UpdateBookingInput,
): Promise<Booking> {
  return request<Booking>(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteBooking(id: number): Promise<void> {
  return request<void>(`/bookings/${id}`, { method: 'DELETE' });
}
