"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import TimeSlotGrid, { TIME_SLOTS } from "@/components/TimeSlotGrid";

type Member = {
  id: string;
  name: string;
};

type Props = {
  members: Member[];
};

export default function NameSelector({ members }: Props) {
  const [selectedId, setSelectedId] = useState("");
  // 日付 → 選択済みスロットの配列（例: { "2026-04-08": ["09:00", "09:30"] }）
  const [availabilities, setAvailabilities] = useState<Record<string, string[]>>({});
  const [activeDate, setActiveDate] = useState("");
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  const selectedMember = members.find((m) => m.id === selectedId);
  const activeDateSlots = availabilities[activeDate] ?? [];
  const datesWithSlots = Object.keys(availabilities).filter(
    (d) => availabilities[d].length > 0
  );

  function handleSlotTap(slot: string) {
    const currentSlots = availabilities[activeDate] ?? [];

    if (rangeStart === null) {
      if (currentSlots.includes(slot)) {
        // 選択済みスロットをタップ → 解除
        setAvailabilities((prev) => ({
          ...prev,
          [activeDate]: currentSlots.filter((s) => s !== slot),
        }));
      } else {
        // 未選択スロットの1タップ目 → rangeStart を設定
        setRangeStart(slot);
      }
    } else {
      // 2タップ目 → rangeStart から slot までの範囲を選択
      const startIdx = TIME_SLOTS.indexOf(rangeStart);
      const endIdx = TIME_SLOTS.indexOf(slot);
      const [from, to] = startIdx <= endIdx
        ? [startIdx, endIdx]
        : [endIdx, startIdx];
      const rangeSlots = TIME_SLOTS.slice(from, to + 1);

      setAvailabilities((prev) => ({
        ...prev,
        [activeDate]: [...new Set([...currentSlots, ...rangeSlots])],
      }));
      setRangeStart(null);
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm">
      {/* 名前のドロップダウン */}
      <div className="flex flex-col gap-2">
        <label className="font-medium">名前を選んでください</label>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setAvailabilities({});
            setActiveDate("");
            setRangeStart(null);
          }}
          className="border border-gray-300 rounded-lg px-4 h-11 focus:outline-none focus:border-black"
        >
          <option value="">-- 選択してください --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* 名前が選択されたらカレンダーを表示 */}
      {selectedMember && (
        <>
          <div className="flex flex-col gap-2">
            <p className="font-medium">空きのある日を選んでください</p>
            <Calendar
              activeDate={activeDate}
              datesWithSlots={datesWithSlots}
              onSelectDate={(date) => {
                setActiveDate(date);
                setRangeStart(null);
              }}
            />
          </div>

          {/* 日付が選択されたら時間スロットを表示 */}
          {activeDate && (
            <div className="flex flex-col gap-2">
              <p className="font-medium">
                {activeDate} の空き時間を選んでください
              </p>
              {rangeStart ? (
                <p className="text-sm text-gray-500">
                  {rangeStart} を選択中。終わりの時間をタップしてください
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  始まりの時間をタップしてください
                </p>
              )}
              <TimeSlotGrid
                selectedSlots={activeDateSlots}
                rangeStart={rangeStart}
                onTap={handleSlotTap}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
