"use client";

import Link from "next/link";
import { useState } from "react";
import type { AnalysisRecord } from "@/lib/db";
import type { NibeLogAnalysis } from "@/lib/nibeLogParser";
import { decodeSerialNumber } from "@/lib/serialNumber";

interface AnalysisListProps {
  records: AnalysisRecord[];
  onDelete: (id: number) => void;
  onCommentChange: (id: number, comment: string) => void;
}

export default function AnalysisList({ records, onDelete, onCommentChange }: AnalysisListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  if (records.length === 0) {
    return <p className="mt-6 text-sm text-zinc-500">No log files analyzed yet.</p>;
  }

  const sorted = [...records].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  const startEditing = (record: AnalysisRecord) => {
    if (record.id === undefined) return;
    setDraft(record.comment ?? "");
    setEditingId(record.id);
  };

  const commitEditing = (id: number) => {
    onCommentChange(id, draft);
    setEditingId(null);
  };

  return (
    <ul className="mt-6 flex w-full flex-col gap-3">
      {sorted.map((record) => {
        const analysis = record.result as NibeLogAnalysis;
        const serialInfo = decodeSerialNumber(analysis.serialNumber);
        return (
          <li
            key={record.id}
            className="overflow-hidden rounded-lg border border-zinc-200 text-sm dark:border-zinc-800"
          >
            <Link
              href={`/log/${record.id}`}
              className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
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
            <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-900">
              {editingId === record.id ? (
                <textarea
                  autoFocus
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitEditing(record.id as number)}
                  placeholder="Add a comment…"
                  className="w-full resize-none rounded border border-zinc-300 bg-white p-2 text-xs text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEditing(record)}
                  className="w-full rounded p-2 text-left text-xs text-zinc-500 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:bg-zinc-900"
                >
                  {record.comment ? record.comment : "Add a comment…"}
                </button>
              )}
            </div>
            <div className="flex justify-end border-t border-zinc-100 px-4 py-2 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => record.id !== undefined && onDelete(record.id)}
                className="text-xs text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
