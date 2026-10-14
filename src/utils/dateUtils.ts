/**
 * Date and time formatting utilities for ¿Y hoy?
 * Dynamically evaluates dates against the user's local timezone (Argentina Standard Time UTC-3)
 */

export function parseDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function isToday(dateInput: string | Date): boolean {
  const d = parseDate(dateInput);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isTomorrow(dateInput: string | Date): boolean {
  const d = parseDate(dateInput);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  );
}

export function isThisWeekend(dateInput: string | Date): boolean {
  const d = parseDate(dateInput);
  const now = new Date();
  const dayOfWeek = d.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday

  // Difference in days from today
  const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // If it's Friday night, Saturday, or Sunday within the next 6 days
  if (diffDays >= -1 && diffDays <= 6) {
    return dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  }
  return false;
}

export function isUpcoming(dateInput: string | Date): boolean {
  const d = parseDate(dateInput);
  const now = new Date();
  return d.getTime() >= now.getTime();
}

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function formatDateBadge(dateInput: string | Date): string {
  const d = parseDate(dateInput);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday(d)) {
    return `Hoy ${timeStr}`;
  }
  if (isTomorrow(d)) {
    return `Mañana ${timeStr}`;
  }

  const dayName = DAYS_ES[d.getDay()];
  const dayNum = d.getDate();
  const monthName = MONTHS_ES[d.getMonth()];
  return `${dayName} ${dayNum} ${monthName}`;
}

export function formatTimeDisplay(dateInput: string | Date): string {
  const d = parseDate(dateInput);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes} hs`;

  if (isToday(d)) {
    return `Hoy · ${timeStr}`;
  }
  if (isTomorrow(d)) {
    return `Mañana · ${timeStr}`;
  }

  const dayName = DAYS_ES[d.getDay()];
  const dayNum = d.getDate();
  const monthName = MONTHS_ES[d.getMonth()];
  return `${dayName} ${dayNum} ${monthName} · ${timeStr}`;
}

export function formatFullDate(dateInput: string | Date): string {
  const d = parseDate(dateInput);
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
