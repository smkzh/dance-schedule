"use client";

import { useState } from "react";
import { TIME_SLOTS } from "@/lib/timeSlots";
import type { DateSlots, SlotInfo } from "@/lib/calculateSlotAbsences";

type Props = {
  dateSlots: DateSlots[];
  totalMembers: number; // 非振付者の人数（フィルターの最大値）
};

type Tooltip = {
  slotInfo: SlotInfo;
  x: number;
  y: number;
};

// 欠席数に応じた背景色
function absenceColor(absences: number, total: number): string {
  if (total === 0 || absences === 0) return "#000000";
  const ratio = absences / total;
  const lightness = Math.round(20 + ratio * 70); // 20%〜90%
  return `hsl(0, 0%, ${lightness}%)`;
}

// 時間軸ラベル（1時間おき）
const HOUR_LABELS = TIME_SLOTS.filter((s) => s.endsWith(":00"));

export default function GanttChart({ dateSlots, totalMembers }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [threshold, setThreshold] = useState(totalMembers);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  // 表示中の月の全日付を生成する
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const dateSlotsMap = Object.fromEntries(dateSlots.map((d) => [d.date, d]));
  const allDatesInMonth: DateSlots[] = Array.from({ length: daysInMonth }, (_, i) => {
    const date = `${monthStr}-${String(i + 1).padStart(2, "0")}`;
    return dateSlotsMap[date] ?? { date, slots: [] };
  });

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const slotWidth = 100 / TIME_SLOTS.length; // 各スロットの幅(%)

  return (
    <div className="w-full overflow-x-auto">
      {/* ヘッダー: 月ナビ + 欠席フィルター */}
      <div className="flex items-center justify-between mb-4 min-w-[600px]">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="px-2 py-1 hover:bg-gray-100 rounded">
            ◀
          </button>
          <span className="font-medium text-lg">{year}年 {month}月</span>
          <button onClick={nextMonth} className="px-2 py-1 hover:bg-gray-100 rounded">
            ▶
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>欠席</span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {Array.from({ length: totalMembers + 1 }, (_, i) => (
              <option key={i} value={i}>{i}人</option>
            ))}
          </select>
          <span>まで表示</span>
        </div>
      </div>

      {/* チャート本体 */}
      <div className="min-w-[600px]">
        {/* 時間軸ラベル */}
        <div className="flex mb-1 pl-16">
          <div className="relative flex-1">
            {HOUR_LABELS.map((label) => {
              const idx = TIME_SLOTS.indexOf(label);
              return (
                <span
                  key={label}
                  className="absolute text-xs text-gray-400 -translate-x-1/2"
                  style={{ left: `${(idx / TIME_SLOTS.length) * 100}%` }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* 日付ごとの行 */}
        <div className="flex flex-col mt-4">
          {allDatesInMonth.map((dateRow) => {
              const day = dateRow.date.slice(8); // "2026-04-08" → "08"
              return (
                <div key={dateRow.date} className="flex items-center border-b border-gray-100 py-1">
                  {/* 日付ラベル */}
                  <span className="w-16 text-sm text-gray-600 shrink-0">
                    {parseInt(day)}日
                  </span>

                  {/* タイムライン */}
                  <div className="relative flex-1 h-7">
                    {dateRow.slots
                      .filter((s) => s.absences <= threshold)
                      .map((s) => {
                        const idx = TIME_SLOTS.indexOf(s.slot);
                        return (
                          <div
                            key={s.slot}
                            className="absolute top-0 h-full cursor-default"
                            style={{
                              left: `${(idx / TIME_SLOTS.length) * 100}%`,
                              width: `${slotWidth}%`,
                              backgroundColor: absenceColor(s.absences, totalMembers),
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({ slotInfo: s, x: rect.left, y: rect.top });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={(e) => {
                              // スマホ: タップでツールチップ表示/非表示
                              if (tooltip?.slotInfo.slot === s.slot) {
                                setTooltip(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltip({ slotInfo: s, x: rect.left, y: rect.top });
                              }
                            }}
                          />
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ツールチップ */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 80 }}
        >
          <p className="font-medium">{tooltip.slotInfo.slot}</p>
          <p>欠席 {tooltip.slotInfo.absences}名</p>
          {tooltip.slotInfo.absentNames.length > 0 && (
            <p className="text-gray-500">{tooltip.slotInfo.absentNames.join("・")}</p>
          )}
        </div>
      )}
    </div>
  );
}
