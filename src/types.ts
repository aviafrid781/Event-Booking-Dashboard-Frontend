export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface EventDto {
  id: number;
  name: string;
  date: string;
  totalSeats: number;
  bookedSeats: number;
  remainingSeats: number;
  price: string;
}

export interface Booking {
  id: number;
  reference: string;
  eventId: number;
  event?: { id: number; name: string; price?: string };
  customerName: string;
  customerEmail: string;
  seats: number;
  status: BookingStatus;
  failureReason: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateBookingInput {
  requestId: string;
  eventId: number;
  customerName: string;
  customerEmail: string;
  seats: number;
}

export interface UpdateBookingInput {
  customerName?: string;
  customerEmail?: string;
  seats?: number;
}
