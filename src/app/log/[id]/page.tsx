"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAnalysis, updateAnalysisComment, type AnalysisRecord } from "@/lib/db";
import type { NibeLogAnalysis } from "@/lib/nibeLogParser";
import { decodeSerialNumber } from "@/lib/serialNumber";

const BACK_LINK_CLASSES =
  "text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

export default function LogPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<AnalysisRecord | null | undefined>(undefined);
  const [editingComment, setEditingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void getAnalysis(Number(params.id)).then((result) => setRecord(result ?? null));
  }, [params.id]);

  const startEditingComment = () => {
    setCommentDraft(record?.comment ?? "");
    setEditingComment(true);
  };

  const commitComment = async () => {
    if (record?.id === undefined) return;
    await updateAnalysisComment(record.id, commentDraft);
    setRecord({ ...record, comment: commentDraft });
    setEditingComment(false);
  };

  if (record === undefined) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (record === null) {
    return (
      <div className="w-full">
        <Link href="/" className={BACK_LINK_CLASSES}>
          ← Back to home
        </Link>
        <p className="mt-4 text-sm text-zinc-500">Log not found.</p>
      </div>
    );
  }

  const analysis = record.result as NibeLogAnalysis;
  const serialInfo = decodeSerialNumber(analysis.serialNumber);

  return (
    <div className="w-full">
      <Link href="/" className={BACK_LINK_CLASSES}>
        ← Back to home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {record.fileName}
      </h1>
      <p className="mt-1 text-xs text-zinc-500">
        Uploaded {new Date(record.uploadedAt).toLocaleString()}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
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
      </dl>

      <h2 className="mt-6 text-sm font-medium text-zinc-900 dark:text-zinc-100">Comment</h2>
      {editingComment ? (
        <textarea
          autoFocus
          rows={3}
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          onBlur={() => void commitComment()}
          placeholder="Add a comment…"
          className="mt-2 w-full resize-none rounded border border-zinc-300 bg-white p-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      ) : (
        <button
          type="button"
          onClick={startEditingComment}
          className="mt-2 w-full rounded border border-transparent p-2 text-left text-sm text-zinc-500 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:bg-zinc-900"
        >
          {record.comment ? record.comment : "Add a comment…"}
        </button>
      )}

      <h2 className="mt-6 text-sm font-medium text-zinc-900 dark:text-zinc-100">Alarms</h2>
      {analysis.alarms.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No alarms recorded.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {analysis.alarms.map((alarm) => (
            <li
              key={alarm.code}
              className="rounded-lg border border-zinc-200 p-3 text-xs dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{alarm.code}</span>
                <span className="text-zinc-500">
                  {alarm.count}x
                </span>
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                First seen {alarm.firstSeen} · Last seen {alarm.lastSeen}
              </p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Start times: {(alarm.startTimes ?? []).map((t) => t.slice(11, 16)).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
