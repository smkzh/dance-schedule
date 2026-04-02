"use client";

import { useState } from "react";

type Props = {
  activeDate: string;          // 現在編集中の日付（"YYYY-MM-DD"）
  datesWithSlots: string[];    // スロットが1つ以上選択されている日付
  onSelectDate: (date: string) => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ activeDate, datesWithSlots, onSelectDate }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function toDateString(day: number): string {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  return (
    <div className="w-full max-w-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="px-3 py-1 rounded hover:bg-gray-100">◀</button>
        <span className="font-medium">{year}年{month + 1}月</span>
        <button onClick={nextMonth} className="px-3 py-1 rounded hover:bg-gray-100">▶</button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* 日付のマス目 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const dateStr = toDateString(day);
          const isActive = dateStr === activeDate;
          const hasSlots = datesWithSlots.includes(dateStr);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square rounded-full text-sm flex flex-col items-center justify-center transition-colors
                ${isActive ? "bg-black text-white" : "hover:bg-gray-100 text-gray-800"}
              `}
            >
              {day}
              {/* スロットが選択されている日付に小さなドットを表示 */}
              {hasSlots && !isActive && (
                <span className="w-1 h-1 rounded-full bg-black mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
