// Format the date
export function formatDate(
  date: string | undefined,
): string {
  if (!date) return '';

  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
