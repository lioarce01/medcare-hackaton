import { DateTime } from "luxon";

// Convierte una hora local (HH:mm) y zona horaria a UTC (HH:mm en UTC)
export function localToUTC(timeStr: string, timezone?: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const today = DateTime.now().setZone(timezone || "local");
  const localDateTime = today.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  const utcDateTime = localDateTime.toUTC();
  return utcDateTime.toFormat("HH:mm");
}

// Convierte una hora UTC (HH:mm) a la hora local del usuario (HH:mm en su zona horaria)
export function UTCToLocal(timeStr: string, timezone?: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const todayUTC = DateTime.utc().set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  const localDateTime = todayUTC.setZone(timezone || "local");
  return localDateTime.toFormat("HH:mm");
}

// Formatea una fecha a string legible en la zona horaria del usuario
export function formatDate(date: Date | string, timezone?: string): string {
  const dt = typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.setZone(timezone || "local").toLocaleString(DateTime.DATE_MED);
}

// Formatea fecha y hora a string legible en la zona horaria del usuario
export function formatDateTime(date: Date | string, timezone?: string): string {
  const dt = typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.setZone(timezone || "local").toLocaleString(DateTime.DATETIME_MED);
}
