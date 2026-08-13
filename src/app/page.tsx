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
    <div className="mt-10 w-full">
      <div className="flex justify-end">
        <Link
          href="/tasks"
          className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Tasks →
        </Link>
      </div>
      <FileUploader onAnalyzed={loadRecords} />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleClearAll}
          disabled={records.length === 0}
          className="text-sm text-etb-red underline underline-offset-2 hover:opacity-80 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline disabled:opacity-100"
        >
          Clear all logs
        </button>
      </div>
      <AlarmChart records={records} />
      <AnalysisList
        records={records}
        onDelete={handleDeleteLog}
        onCommentChange={handleCommentChange}
      />
    </div>
  );
}
