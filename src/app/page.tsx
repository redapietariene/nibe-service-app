"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import AlarmChart from "./components/AlarmChart";
import AnalysisList from "./components/AnalysisList";
import FileUploader from "./components/FileUploader";
import { clearAllAnalyses, getAnalyses, type AnalysisRecord } from "@/lib/db";

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

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center py-16 px-16 bg-white dark:bg-black">
        <Image
          className="h-10 w-auto bg-white p-1 rounded"
          src="/nibe-logo.svg"
          alt="NIBE logo"
          width={200}
          height={48}
          priority
        />
        <div className="mt-10 w-full">
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
          <AnalysisList records={records} />
        </div>
      </main>
    </div>
  );
}
