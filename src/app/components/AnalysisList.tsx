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
    return (
      <section>
        <h2 className="font-display text-lg font-black uppercase tracking-tight text-foreground">
          Analyzed logs
        </h2>
        <p className="mt-3 text-sm text-muted">No log files analyzed yet.</p>
      </section>
    );
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
    <section>
      <h2 className="font-display text-lg font-black uppercase tracking-tight text-foreground">
        Analyzed logs <span className="text-muted">({sorted.length})</span>
      </h2>
      <ul className="mt-4 flex w-full flex-col gap-3">
        {sorted.map((record) => {
          const analysis = record.result as NibeLogAnalysis;
          const serialInfo = decodeSerialNumber(analysis.serialNumber);
          return (
            <li
              key={record.id}
              className="overflow-hidden rounded-md border border-line bg-surface text-sm"
            >
              <Link
                href={`/log/${record.id}`}
                className="block p-4 hover:bg-cold-soft"
              >
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <span className="min-w-0 truncate font-mono text-sm font-medium text-foreground">
                    {record.fileName}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {new Date(record.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-xs">
                  <dt className="uppercase tracking-wide text-muted">Log period</dt>
                  <dd className="text-foreground">
                    {analysis.dateFrom ?? "—"} – {analysis.dateTo ?? "—"}
                  </dd>
                  <dt className="uppercase tracking-wide text-muted">Serial number</dt>
                  <dd className="text-foreground">{analysis.serialNumber ?? "—"}</dd>
                  <dt className="uppercase tracking-wide text-muted">Article number</dt>
                  <dd className="text-foreground">{serialInfo?.articleNumber ?? "—"}</dd>
                  <dt className="uppercase tracking-wide text-muted">Date of manufacturing</dt>
                  <dd className="text-foreground">{serialInfo?.manufactureDate ?? "—"}</dd>
                  <dt className="uppercase tracking-wide text-muted">Software version</dt>
                  <dd className="text-foreground">{analysis.softwareVersion ?? "—"}</dd>
                  <dt className="uppercase tracking-wide text-muted">Alarms</dt>
                  <dd className={analysis.alarms.length ? "font-medium text-hot" : "text-foreground"}>
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
              <div className="border-t border-line px-4 py-2">
                {editingId === record.id ? (
                  <textarea
                    autoFocus
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commitEditing(record.id as number)}
                    placeholder="Add a comment…"
                    className="w-full resize-none rounded border border-line bg-background p-2 text-xs text-foreground outline-none focus:border-cold"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(record)}
                    className="w-full rounded p-2 text-left text-xs text-muted hover:bg-cold-soft"
                  >
                    {record.comment ? record.comment : "Add a comment…"}
                  </button>
                )}
              </div>
              <div className="flex justify-end border-t border-line px-4 py-2">
                <button
                  type="button"
                  onClick={() => record.id !== undefined && onDelete(record.id)}
                  className="font-mono text-xs uppercase tracking-wide text-hot underline underline-offset-4 hover:opacity-80"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
