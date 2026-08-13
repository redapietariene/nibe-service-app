import Link from "next/link";
import type { AnalysisRecord } from "@/lib/db";
import type { NibeLogAnalysis } from "@/lib/nibeLogParser";
import { decodeSerialNumber } from "@/lib/serialNumber";

interface AnalysisListProps {
  records: AnalysisRecord[];
}

export default function AnalysisList({ records }: AnalysisListProps) {
  if (records.length === 0) {
    return <p className="mt-6 text-sm text-zinc-500">No log files analyzed yet.</p>;
  }

  const sorted = [...records].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  return (
    <ul className="mt-6 flex w-full flex-col gap-3">
      {sorted.map((record) => {
        const analysis = record.result as NibeLogAnalysis;
        const serialInfo = decodeSerialNumber(analysis.serialNumber);
        return (
          <li
            key={record.id}
            className="rounded-lg border border-zinc-200 text-sm dark:border-zinc-800"
          >
            <Link
              href={`/log/${record.id}`}
              className="block rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{record.fileName}</span>
                <span className="text-xs text-zinc-500">
                  {new Date(record.uploadedAt).toLocaleString()}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <dt>Log period</dt>
                <dd>
                  {analysis.dateFrom ?? "—"} – {analysis.dateTo ?? "—"}
                </dd>
                <dt>Serial number</dt>
                <dd>{analysis.serialNumber ?? "—"}</dd>
                <dt>Article number</dt>
                <dd>{serialInfo?.articleNumber ?? "—"}</dd>
                <dt>Date of manufacturing</dt>
                <dd>{serialInfo?.manufactureDate ?? "—"}</dd>
                <dt>Software version</dt>
                <dd>{analysis.softwareVersion ?? "—"}</dd>
                <dt>Alarms</dt>
                <dd>
                  {analysis.alarms.length
                    ? `Yes, ${analysis.alarms
                        .map(
                          (alarm) =>
                            `${alarm.code} x ${alarm.count} (${(alarm.startTimes ?? [])
                              .map((t) => t.slice(11, 16))
                              .join(", ")})`,
                        )
                        .join(", ")}`
                    : "No"}
                </dd>
              </dl>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
