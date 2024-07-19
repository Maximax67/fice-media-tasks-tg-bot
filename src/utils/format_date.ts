export function formatDate(date: Date, isUpdateTime: boolean = false) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isUpdateTime) {
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}:${seconds}`;
  }

  if (hours === '23' && minutes === '59') {
    return `${day}.${month}`;
  }

  return `${day}.${month} ${hours}:${minutes}`;
}
