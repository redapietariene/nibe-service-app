"use client";

import { useRef, useState } from "react";
import { saveAnalysis } from "@/lib/db";
import { parseNibeLog } from "@/lib/nibeLogParser";

interface FileUploaderProps {
  onAnalyzed: () => void;
}

const MAX_TOTAL_BYTES = 500 * 1024 * 1024;

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUploader({ onAnalyzed }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFiles = (fileList: FileList | null) => {
    const selected = Array.from(fileList ?? []);
    if (selected.length === 0) return;

    const totalSize = selected.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_BYTES) {
      setError(
        `The selected files total ${formatMb(totalSize)}, which is over the 500 MB upload limit. Please select fewer or smaller files and try again.`,
      );
      setFiles([]);
      resetInput();
      return;
    }

    setFiles(selected);
    setError(null);
  };

  const analyzeFile = async (file: File) => {
    const text = await file.text();
    const result = parseNibeLog(text);
    await saveAnalysis({
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      result,
    });
  };

  const handleOk = async () => {
    if (files.length === 0) return;
    setIsSaving(true);
    setError(null);

    const failed: string[] = [];
    for (const file of files) {
      try {
        await analyzeFile(file);
      } catch (err) {
        console.error(`Failed to analyze ${file.name}:`, err);
        failed.push(file.name);
      }
    }

    setFiles([]);
    resetInput();
    setIsSaving(false);
    if (failed.length > 0) {
      setError(
        `Could not analyze ${failed.length === 1 ? "this file" : "these files"}: ${failed.join(", ")}. Please check they're valid Nibe log exports.`,
      );
    }
    onAnalyzed();
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
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {files.length > 0 ? (
          <ul className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="truncate">
                {f.name} ({formatMb(f.size)})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Drag and drop log files here, or click to browse (up to 500 MB total)
          </p>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={files.length === 0 || isSaving}
        onClick={handleOk}
        className="mt-4 rounded bg-etb-red px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
      >
        {isSaving ? "Analyzing..." : "OK"}
      </button>
    </div>
  );
}
