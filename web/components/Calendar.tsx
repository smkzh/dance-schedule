"use client";

import { useState } from "react";

type Props = {
  selectedDates: string[]; // "YYYY-MM-DD" 形式の日付配列
  onToggle: (date: string) => void; // 日付をタップしたときに呼ばれる
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ selectedDates, onToggle }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0始まり（0=1月）

  // その月の1日が何曜日か（0=日曜）
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // その月の日数
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // カレンダーのマス目を生成（月初の空白 + 日付）
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 日付を "YYYY-MM-DD" 形式の文字列に変換する
  function toDateString(day: number): string {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* ヘッダー（月の移動） */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          ◀
        </button>
        <span className="font-medium">
          {year}年{month + 1}月
        </span>
        <button
          onClick={nextMonth}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          ▶
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 日付のマス目 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const dateStr = toDateString(day);
          const isSelected = selectedDates.includes(dateStr);

          return (
            <button
              key={i}
              onClick={() => onToggle(dateStr)}
              className={`aspect-square rounded-full text-sm flex items-center justify-center transition-colors
                ${isSelected
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-gray-800"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
