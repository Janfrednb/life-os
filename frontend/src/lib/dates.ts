function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Los completados de hábitos se guardan como medianoche UTC representando el
// día local del usuario (ver fix de timezone), así que se leen con getters UTC
// para recuperar ese mismo día de calendario sin importar la zona del viewer.
export function habitCompletionDayKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function startOfWeek(d: Date): Date {
  const day = (d.getDay() + 6) % 7; // Lun=0 ... Dom=6
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}
