"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import TimeSlotGrid, { TIME_SLOTS } from "@/components/TimeSlotGrid";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  name: string;
};

type Props = {
  members: Member[];
};

export default function NameSelector({ members }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [availabilities, setAvailabilities] = useState<Record<string, string[]>>({});
  const [activeDate, setActiveDate] = useState("");
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"success" | "error" | null>(null);

  const selectedMember = members.find((m) => m.id === selectedId);
  const activeDateSlots = availabilities[activeDate] ?? [];
  const datesWithSlots = Object.keys(availabilities).filter(
    (d) => availabilities[d].length > 0
  );

  // 名前が選択されたとき、既存の提出データを取得して復元する
  useEffect(() => {
    if (!selectedId) return;

    async function fetchExisting() {
      const { data } = await supabase
        .from("availabilities")
        .select("available_date, time_slot")
        .eq("member_id", selectedId);

      if (!data || data.length === 0) return;

      // 取得したデータを Record<string, string[]> 形式に変換する
      const restored: Record<string, string[]> = {};
      for (const row of data) {
        const date = row.available_date;
        const slot = row.time_slot.slice(0, 5); // "09:00:00" → "09:00"
        if (!restored[date]) restored[date] = [];
        restored[date].push(slot);
      }
      setAvailabilities(restored);
    }

    fetchExisting();
  }, [selectedId]);

  function handleSlotTap(slot: string) {
    const currentSlots = availabilities[activeDate] ?? [];

    if (rangeStart === null) {
      if (currentSlots.includes(slot)) {
        setAvailabilities((prev) => ({
          ...prev,
          [activeDate]: currentSlots.filter((s) => s !== slot),
        }));
      } else {
        setRangeStart(slot);
      }
    } else {
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

  async function handleSubmit() {
    if (!selectedId) return;
    setIsSubmitting(true);
    setSubmitResult(null);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: selectedId, availabilities }),
    });

    setIsSubmitting(false);
    setSubmitResult(res.ok ? "success" : "error");
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
            setSubmitResult(null);
          }}
          className="border border-gray-300 rounded-lg px-4 h-11 focus:outline-none focus:border-black"
        >
          <option value="">-- 選択してください --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

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

          {/* 提出ボタン */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-11 rounded-lg bg-black text-white font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {isSubmitting ? "送信中..." : "提出する"}
            </button>
            {submitResult === "success" && (
              <p className="text-green-600 text-sm text-center">提出しました</p>
            )}
            {submitResult === "error" && (
              <p className="text-red-500 text-sm text-center">提出に失敗しました</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
