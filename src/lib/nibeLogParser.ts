export interface NibeAlarm {
  code: string;
  firstSeen: string;
  lastSeen: string;
  count: number;
}

export interface AlarmCountBucket {
  bucket: string;
  count: number;
}

export interface NibeLogAnalysis {
  serialNumber: string | null;
  softwareVersion: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  alarms: NibeAlarm[];
  alarmCountsByDay: AlarmCountBucket[];
  alarmCountsByHour: AlarmCountBucket[];
}

const TIMESTAMP_COLUMN = 0;
const NO_ALARM_VALUES = new Set(["0", "-"]);

export function parseNibeLog(text: string): NibeLogAnalysis {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      serialNumber: null,
      softwareVersion: null,
      dateFrom: null,
      dateTo: null,
      alarms: [],
      alarmCountsByDay: [],
      alarmCountsByHour: [],
    };
  }

  const header = lines[0].split("\t");
  const larmIndex = header.indexOf("Larmnummer");
  const serialIndex = header.indexOf("Serienummer");
  const softwareIndex = header.indexOf("Mjukvaruversion");

  const dataRows = lines.slice(1).map((line) => line.split("\t"));
  const firstRow = dataRows[0];
  const lastRow = dataRows[dataRows.length - 1];

  // An alarm "occurrence" is counted when the alarm code changes to a new
  // non-empty value, not on every sample row it stays active for.
  const alarmsByCode = new Map<string, NibeAlarm>();
  const countsByDay = new Map<string, number>();
  const countsByHour = new Map<string, number>();
  let previousCode: string | null = null;

  for (const row of dataRows) {
    const code = larmIndex >= 0 ? row[larmIndex] : undefined;
    const isAlarm = Boolean(code) && !NO_ALARM_VALUES.has(code as string);
    const isNewOccurrence = isAlarm && code !== previousCode;
    previousCode = isAlarm ? (code as string) : null;

    if (!isNewOccurrence) continue;

    const timestamp = row[TIMESTAMP_COLUMN];
    const existing = alarmsByCode.get(code as string);
    if (existing) {
      existing.lastSeen = timestamp;
      existing.count += 1;
    } else {
      alarmsByCode.set(code as string, {
        code: code as string,
        firstSeen: timestamp,
        lastSeen: timestamp,
        count: 1,
      });
    }

    const dayBucket = timestamp.slice(0, 10);
    const hourBucket = `${timestamp.slice(0, 13)}:00`;
    countsByDay.set(dayBucket, (countsByDay.get(dayBucket) ?? 0) + 1);
    countsByHour.set(hourBucket, (countsByHour.get(hourBucket) ?? 0) + 1);
  }

  const toSortedBuckets = (counts: Map<string, number>): AlarmCountBucket[] =>
    Array.from(counts.entries())
      .map(([bucket, count]) => ({ bucket, count }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket));

  return {
    serialNumber: serialIndex >= 0 ? firstRow[serialIndex] ?? null : null,
    softwareVersion: softwareIndex >= 0 ? firstRow[softwareIndex] ?? null : null,
    dateFrom: firstRow[TIMESTAMP_COLUMN] ?? null,
    dateTo: lastRow[TIMESTAMP_COLUMN] ?? null,
    alarms: Array.from(alarmsByCode.values()),
    alarmCountsByDay: toSortedBuckets(countsByDay),
    alarmCountsByHour: toSortedBuckets(countsByHour),
  };
}
