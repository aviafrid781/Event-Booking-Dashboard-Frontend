# Frontend: Event Booking Dashboard

This folder contains the React frontend for the Event Booking System.

## Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app expects the backend API to be available at the URL configured in `frontend/.env`.
By default, this is `http://localhost:4000`.

- `VITE_API_TOKEN` must match the backend `API_TOKEN` value for requests to succeed.

## Run

```bash
npm run dev
```

Open the dashboard in your browser at the URL shown by Vite (usually `http://localhost:5173`).

## Features

- Lists events with live remaining-seat counts.
- Creates new bookings using `POST /bookings`.
- Shows booking statuses as `PENDING`, `CONFIRMED`, or `FAILED`.
- Supports filtering bookings by event and status.
- Supports pagination for bookings.
- Shows booking details, total cost, and delete action.
- Auto-polls every few seconds so the UI updates as async bookings are processed.

## Notes

- A unique `requestId` is generated client-side for each booking submission.
- All API requests include a bearer token from `VITE_API_TOKEN`.
- Deleting a confirmed booking calls `DELETE /bookings/:id` and releases seats.
- The dashboard uses Dhaka timezone formatting for created timestamps and event dates.
