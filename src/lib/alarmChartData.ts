import type { AnalysisRecord } from "@/lib/db";
import type { NibeLogAnalysis } from "@/lib/nibeLogParser";

export type AlarmChartGranularity = "day" | "hour";

export interface AlarmChartPoint {
  bucket: string;
  label: string;
  count: number;
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
  granularity: AlarmChartGranularity
): AlarmChartPoint[] {
  const totals = new Map<string, number>();
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  for (const record of records) {
    const analysis = record.result as NibeLogAnalysis;
    const buckets =
      granularity === "day" ? analysis.alarmCountsByDay : analysis.alarmCountsByHour;
    for (const { bucket, count } of buckets ?? []) {
      totals.set(bucket, (totals.get(bucket) ?? 0) + count);
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

  const points: AlarmChartPoint[] = [];

  if (granularity === "day") {
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    while (cursor <= end) {
      const bucket = dayBucketOf(cursor);
      points.push({ bucket, label: DAY_LABEL_FORMATTER.format(cursor), count: totals.get(bucket) ?? 0 });
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
      const bucket = hourBucketOf(cursor);
      points.push({ bucket, label: HOUR_LABEL_FORMATTER.format(cursor), count: totals.get(bucket) ?? 0 });
      cursor.setHours(cursor.getHours() + 1);
    }
  }

  return points;
}
