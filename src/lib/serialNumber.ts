export interface SerialNumberInfo {
  articleNumber: string;
  manufactureDate: string;
}

// Serial number format (see docs/nibe-log-help.md):
// digits 1-6 = article number, 7-8 = year of manufacture, 9-11 = day of year.
export function decodeSerialNumber(serial: string | null): SerialNumberInfo | null {
  if (!serial || serial.length < 11) return null;

  const articleNumber = serial.slice(0, 6);
  const year = 2000 + Number(serial.slice(6, 8));
  const dayOfYear = Number(serial.slice(8, 11));

  if (!Number.isFinite(year) || !Number.isFinite(dayOfYear) || dayOfYear < 1) return null;

  const date = new Date(Date.UTC(year, 0, dayOfYear));
  if (date.getUTCFullYear() !== year) return null;

  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");

  return {
    articleNumber,
    manufactureDate: `${dd}-${mm}-${date.getUTCFullYear()}`,
  };
}
