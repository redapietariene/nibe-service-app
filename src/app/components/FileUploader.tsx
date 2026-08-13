"use client";

import { useRef, useState } from "react";
import { saveAnalysis } from "@/lib/db";
import { parseNibeLog } from "@/lib/nibeLogParser";

interface FileUploaderProps {
  onAnalyzed: () => void;
}

export default function FileUploader({ onAnalyzed }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const selected = files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleOk = async () => {
    if (!file) return;
    setIsSaving(true);
    setError(null);
    try {
      const text = await file.text();
      const result = parseNibeLog(text);
      await saveAnalysis({
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        result,
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onAnalyzed();
    } catch {
      setError("Could not analyze this file. Please check it's a valid Nibe log export.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-etb-red bg-red-50 dark:bg-red-950"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {file ? file.name : "Drag and drop a log file here, or click to browse"}
        </p>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!file || isSaving}
        onClick={handleOk}
        className="mt-4 rounded bg-etb-red px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
      >
        {isSaving ? "Analyzing..." : "OK"}
      </button>
    </div>
  );
}
