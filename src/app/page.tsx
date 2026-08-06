"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import AlarmChart from "./components/AlarmChart";
import AnalysisList from "./components/AnalysisList";
import FileUploader from "./components/FileUploader";
import { getAnalyses, type AnalysisRecord } from "@/lib/db";

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
          <AlarmChart records={records} />
          <AnalysisList records={records} />
        </div>
      </main>
    </div>
  );
}
