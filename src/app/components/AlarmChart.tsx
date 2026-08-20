"use client";

import { useMemo, useState } from "react";
import type { AnalysisRecord } from "@/lib/db";
import { combineAlarmBuckets, type AlarmChartGranularity } from "@/lib/alarmChartData";

interface AlarmChartProps {
  records: AnalysisRecord[];
}

const PLOT_HEIGHT_PX = 200;
const LABEL_ROW_PX = 24;
const MIN_SLOT_PX = 14;
const MAX_X_LABELS = 10;

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const residual = value / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

function barHeight(count: number, yMax: number): number {
  if (count <= 0) return yMax > 0 ? 2 : 0;
  return Math.max(2, Math.round((count / yMax) * PLOT_HEIGHT_PX));
}

export default function AlarmChart({ records }: AlarmChartProps) {
  const [granularity, setGranularity] = useState<AlarmChartGranularity>("day");
  const [showTable, setShowTable] = useState(false);

  const data = useMemo(() => combineAlarmBuckets(records, granularity), [records, granularity]);
  const yMax = useMemo(() => niceMax(data.reduce((max, d) => Math.max(max, d.count), 0)), [data]);
  const labelStride = Math.max(1, Math.ceil(data.length / MAX_X_LABELS));
  const hasAlarms = data.some((point) => point.count > 0);

  return (
    <div className="w-full rounded-md border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-black uppercase tracking-tight text-foreground">
          Alarms over time
        </h2>
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex overflow-hidden rounded border border-line">
            <button
              type="button"
              onClick={() => setGranularity("day")}
              aria-pressed={granularity === "day"}
              className={`px-2 py-1 uppercase tracking-wide ${
                granularity === "day" ? "bg-panel text-panel-foreground" : "text-muted"
              }`}
            >
              By day
            </button>
            <button
              type="button"
              onClick={() => setGranularity("hour")}
              aria-pressed={granularity === "hour"}
              className={`border-l border-line px-2 py-1 uppercase tracking-wide ${
                granularity === "hour" ? "bg-panel text-panel-foreground" : "text-muted"
              }`}
            >
              By hour
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="uppercase tracking-wide text-cold underline underline-offset-4 hover:text-hot"
          >
            {showTable ? "Show chart" : "Show as table"}
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No log files analyzed yet.</p>
      ) : !hasAlarms ? (
        <p className="mt-6 text-sm text-muted">No alarms recorded in the analyzed logs.</p>
      ) : showTable ? (
        <div className="mt-4 max-h-64 overflow-y-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-muted">
                <th className="py-1 pr-4 font-normal uppercase tracking-wide">Time</th>
                <th className="py-1 font-normal uppercase tracking-wide">Alarms</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.bucket} className="border-t border-line">
                  <td className="py-1 pr-4 text-foreground">{point.label}</td>
                  <td className="py-1 text-foreground">{point.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <div
            className="flex flex-shrink-0 flex-col justify-between text-right font-mono text-[10px] text-muted"
            style={{ height: PLOT_HEIGHT_PX }}
          >
            <span>{yMax}</span>
            <span>{Math.round(yMax / 2)}</span>
            <span>0</span>
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div
              className="flex min-w-full items-end gap-[2px] border-b border-line"
              style={{ width: `${data.length * MIN_SLOT_PX}px`, height: PLOT_HEIGHT_PX }}
            >
              {data.map((point) => (
                <div
                  key={point.bucket}
                  className="group relative flex h-full flex-1 items-end justify-center"
                >
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${point.label}: ${point.count} alarm${point.count === 1 ? "" : "s"}`}
                    className={`mx-auto w-full max-w-[24px] rounded-t-[4px] outline-none focus-visible:ring-2 focus-visible:ring-cold ${
                      point.count > 0 ? "bg-cold" : "bg-line"
                    }`}
                    style={{ height: barHeight(point.count, yMax) }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-panel px-2 py-1 font-mono text-xs text-panel-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <span className="font-medium">{point.count}</span> alarm
                    {point.count === 1 ? "" : "s"} · {point.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-1 flex min-w-full"
              style={{ width: `${data.length * MIN_SLOT_PX}px` }}
            >
              {data.map((point, index) => (
                <div
                  key={point.bucket}
                  className="flex-1 text-center font-mono text-[10px] text-muted"
                  style={{ height: LABEL_ROW_PX }}
                >
                  {index % labelStride === 0 ? point.label : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
