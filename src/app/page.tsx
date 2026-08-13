"use client";

import Image from "next/image";
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
    <>
      <Image
        className="h-10 w-auto bg-white p-1 rounded"
        src="/nibe-logo.svg"
        alt="NIBE logo"
        width={200}
        height={48}
        priority
      />
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
            className="text-sm text-red-600 underline underline-offset-2 hover:text-red-700 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline dark:text-red-500 dark:hover:text-red-400 dark:disabled:text-zinc-600"
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
    </>
  );
}
