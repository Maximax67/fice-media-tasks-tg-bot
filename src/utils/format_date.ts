import { LOCALE, UTC } from '../config';

const options: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
};

export function formatDate(date: Date): string {
  const utcDate = new Date(date.getTime() + UTC * 60 * 60 * 1000);

  return utcDate.toLocaleString(LOCALE, options);
}
