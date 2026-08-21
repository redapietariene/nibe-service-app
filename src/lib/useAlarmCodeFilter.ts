"use client";

import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "nibe:disabledAlarmCodes";

function readDisabledCodes(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? new Set(parsed.filter((value): value is string => typeof value === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

function writeDisabledCodes(codes: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(codes)));
}

interface AlarmCodeFilter {
  enabledCodes: Set<string>;
  isEnabled: (code: string) => boolean;
  toggle: (code: string) => void;
  showAll: () => void;
  hideAll: () => void;
}

// Alarm codes are shown on the chart by default; switching one off hides it,
// and the choice is remembered in this browser the next time the app opens.
export function useAlarmCodeFilter(codes: string[]): AlarmCodeFilter {
  const [disabledCodes, setDisabledCodes] = useState<Set<string>>(() => readDisabledCodes());

  const toggle = useCallback((code: string) => {
    setDisabledCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      writeDisabledCodes(next);
      return next;
    });
  }, []);

  const showAll = useCallback(() => {
    setDisabledCodes(new Set());
    writeDisabledCodes(new Set());
  }, []);

  const hideAll = useCallback(() => {
    const next = new Set(codes);
    setDisabledCodes(next);
    writeDisabledCodes(next);
  }, [codes]);

  const isEnabled = useCallback((code: string) => !disabledCodes.has(code), [disabledCodes]);

  const enabledCodes = useMemo(
    () => new Set(codes.filter((code) => !disabledCodes.has(code))),
    [codes, disabledCodes]
  );

  return { enabledCodes, isEnabled, toggle, showAll, hideAll };
}
