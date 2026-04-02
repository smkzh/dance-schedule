"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";

type Member = {
  id: string;
  name: string;
};

type Props = {
  members: Member[];
};

export default function NameSelector({ members }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const selectedMember = members.find((m) => m.id === selectedId);

  function toggleDate(date: string) {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date) // すでに選択済みなら除去
        : [...prev, date]                // 未選択なら追加
    );
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
            setSelectedDates([]); // 名前を変えたら日付の選択をリセット
          }}
          className="border border-gray-300 rounded-lg px-4 h-11 focus:outline-none focus:border-black"
        >
          <option value="">-- 選択してください --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* 名前が選択されたらカレンダーを表示 */}
      {selectedMember && (
        <>
          <p className="text-gray-600">
            空いている日をタップしてください（{selectedDates.length}日選択中）
          </p>
          <Calendar selectedDates={selectedDates} onToggle={toggleDate} />
        </>
      )}
    </div>
  );
}
