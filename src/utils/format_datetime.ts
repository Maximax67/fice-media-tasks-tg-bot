import { LOCALE, UTC } from '../config';

export function formatDateTime(
  date: Date,
  withSeconds: boolean = false,
): string {
  const utcDate = new Date(date.getTime() + UTC * 60 * 60 * 1000);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    timeZone: 'UTC',
  };

  return utcDate.toLocaleString(LOCALE, options).replace(',', '');
}
