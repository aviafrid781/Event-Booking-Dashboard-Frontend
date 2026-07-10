const DAKHA_TIMEZONE = 'Asia/Dhaka';

export function formatDhakaDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: DAKHA_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatDhakaDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: DAKHA_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
