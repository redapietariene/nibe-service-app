export interface NibeAlarm {
  code: string;
  firstSeen: string;
  lastSeen: string;
  count: number;
}

export interface NibeLogAnalysis {
  serialNumber: string | null;
  softwareVersion: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  alarms: NibeAlarm[];
}

const TIMESTAMP_COLUMN = 0;

export function parseNibeLog(text: string): NibeLogAnalysis {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      serialNumber: null,
      softwareVersion: null,
      dateFrom: null,
      dateTo: null,
      alarms: [],
    };
  }

  const header = lines[0].split("\t");
  const larmIndex = header.indexOf("Larmnummer");
  const serialIndex = header.indexOf("Serienummer");
  const softwareIndex = header.indexOf("Mjukvaruversion");

  const dataRows = lines.slice(1).map((line) => line.split("\t"));
  const firstRow = dataRows[0];
  const lastRow = dataRows[dataRows.length - 1];

  const alarmsByCode = new Map<string, NibeAlarm>();
  for (const row of dataRows) {
    const code = larmIndex >= 0 ? row[larmIndex] : undefined;
    if (!code || code === "0" || code === "-") continue;

    const timestamp = row[TIMESTAMP_COLUMN];
    const existing = alarmsByCode.get(code);
    if (existing) {
      existing.lastSeen = timestamp;
      existing.count += 1;
    } else {
      alarmsByCode.set(code, { code, firstSeen: timestamp, lastSeen: timestamp, count: 1 });
    }
  }

  return {
    serialNumber: serialIndex >= 0 ? firstRow[serialIndex] ?? null : null,
    softwareVersion: softwareIndex >= 0 ? firstRow[softwareIndex] ?? null : null,
    dateFrom: firstRow[TIMESTAMP_COLUMN] ?? null,
    dateTo: lastRow[TIMESTAMP_COLUMN] ?? null,
    alarms: Array.from(alarmsByCode.values()),
  };
}
