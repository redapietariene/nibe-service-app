"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AlarmChart from "./components/AlarmChart";
import AnalysisList from "./components/AnalysisList";
import FileUploader from "./components/FileUploader";
import {
  clearAllAnalyses,
  deleteAnalysis,
  getAnalyses,
  updateAnalysisComment,
  type AnalysisRecord,
} from "@/lib/db";

export default function Home() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  const loadRecords = useCallback(async () => {
    setRecords(await getAnalyses());
  }, []);

  useEffect(() => {
    // Loading initial state from IndexedDB (an external store) on mount,
    // not deriving state from props/state — the sanctioned effect case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecords();
  }, [loadRecords]);

  const handleClearAll = async () => {
    if (!window.confirm("Delete all uploaded log analyses? This cannot be undone.")) return;
    await clearAllAnalyses();
    await loadRecords();
  };

  const handleDeleteLog = async (id: number) => {
    if (!window.confirm("Delete this log analysis? This cannot be undone.")) return;
    await deleteAnalysis(id);
    await loadRecords();
  };

  const handleCommentChange = async (id: number, comment: string) => {
    await updateAnalysisComment(id, comment);
    await loadRecords();
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Log workspace
          </p>
          <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-foreground">
            Upload &amp; review
          </h2>
        </div>
        <Link
          href="/tasks"
          className="mt-1 justify-self-end font-mono text-xs uppercase tracking-wide text-cold underline underline-offset-4 hover:text-hot"
        >
          Tasks →
        </Link>
      </div>

      <section>
        <FileUploader onAnalyzed={loadRecords} />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={records.length === 0}
            className="font-mono text-xs uppercase tracking-wide text-hot underline underline-offset-4 hover:opacity-80 disabled:cursor-not-allowed disabled:text-muted disabled:no-underline disabled:opacity-100"
          >
            Clear all logs
          </button>
        </div>
      </section>

      <AlarmChart records={records} />
      <AnalysisList
        records={records}
        onDelete={handleDeleteLog}
        onCommentChange={handleCommentChange}
      />
    </div>
  );
}
