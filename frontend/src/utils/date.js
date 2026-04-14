export const parseDateInput = (value = new Date()) => {
  if (value instanceof Date) return new Date(value);

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  return new Date(value);
};

export const formatLocalDateInput = (value = new Date()) => {
  const date = parseDateInput(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getRecentDateKeys = (days = 7) => {
  const items = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    items.push(formatLocalDateInput(date));
  }
  return items;
};

export const getDayName = (dateString) => {
  const date = parseDateInput(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
};
