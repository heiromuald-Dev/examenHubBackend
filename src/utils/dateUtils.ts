export const isDateInsideWindow = (now: Date, startsAt: Date, endsAt: Date): boolean => now >= startsAt && now <= endsAt;

export const toDate = (value: unknown, fieldName: string): Date => {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error(`${fieldName} doit être une date ISO valide`);
  return date;
};
