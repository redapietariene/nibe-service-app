import type { AnalysisRecord } from "@/lib/db";
import type { NibeLogAnalysis } from "@/lib/nibeLogParser";

export type AlarmChartGranularity = "day" | "hour";

export interface AlarmCodeSummary {
  code: string;
  count: number;
}

export interface AlarmChartPoint {
  bucket: string;
  label: string;
  count: number;
  codes: AlarmCodeSummary[];
}

// Distinct alarm codes found across the analyzed logs, with their total
// occurrence count, sorted for stable display order.
export function getAlarmCodeSummary(records: AnalysisRecord[]): AlarmCodeSummary[] {
  const totals = new Map<string, number>();
  for (const record of records) {
    const analysis = record.result as NibeLogAnalysis;
    for (const alarm of analysis.alarms ?? []) {
      totals.set(alarm.code, (totals.get(alarm.code) ?? 0) + alarm.count);
    }
  }
  return Array.from(totals.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
}

function parseTimestamp(value: string): Date {
  return new Date(value.replace(" ", "T"));
}

function dayBucketOf(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hourBucketOf(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  return `${dayBucketOf(date)} ${h}:00`;
}

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});
const HOUR_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// Builds a continuous bucket sequence spanning the analyzed logs' full date
// range, so gaps with zero alarms show as zero-height columns rather than
// being skipped and compressing the time axis.
export function combineAlarmBuckets(
  records: AnalysisRecord[],
  granularity: AlarmChartGranularity,
  enabledCodes: ReadonlySet<string>
): AlarmChartPoint[] {
  const totals = new Map<string, Map<string, number>>();
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  for (const record of records) {
    const analysis = record.result as NibeLogAnalysis;
    for (const alarm of analysis.alarms ?? []) {
      if (!enabledCodes.has(alarm.code)) continue;
      for (const timestamp of alarm.startTimes) {
        const bucket = granularity === "day" ? timestamp.slice(0, 10) : `${timestamp.slice(0, 13)}:00`;
        const bucketCodes = totals.get(bucket) ?? new Map<string, number>();
        bucketCodes.set(alarm.code, (bucketCodes.get(alarm.code) ?? 0) + 1);
        totals.set(bucket, bucketCodes);
      }
    }

    if (analysis.dateFrom) {
      const from = parseTimestamp(analysis.dateFrom);
      if (!rangeStart || from < rangeStart) rangeStart = from;
    }
    if (analysis.dateTo) {
      const to = parseTimestamp(analysis.dateTo);
      if (!rangeEnd || to > rangeEnd) rangeEnd = to;
    }
  }

  if (!rangeStart || !rangeEnd) return [];

  const pointFor = (bucket: string, label: string): AlarmChartPoint => {
    const codes = Array.from(totals.get(bucket)?.entries() ?? [])
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    const count = codes.reduce((sum, c) => sum + c.count, 0);
    return { bucket, label, count, codes };
  };

  const points: AlarmChartPoint[] = [];

  if (granularity === "day") {
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    while (cursor <= end) {
      points.push(pointFor(dayBucketOf(cursor), DAY_LABEL_FORMATTER.format(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    const cursor = new Date(
      rangeStart.getFullYear(),
      rangeStart.getMonth(),
      rangeStart.getDate(),
      rangeStart.getHours()
    );
    const end = new Date(
      rangeEnd.getFullYear(),
      rangeEnd.getMonth(),
      rangeEnd.getDate(),
      rangeEnd.getHours()
    );
    while (cursor <= end) {
      points.push(pointFor(hourBucketOf(cursor), HOUR_LABEL_FORMATTER.format(cursor)));
      cursor.setHours(cursor.getHours() + 1);
    }
  }

  return points;
}
