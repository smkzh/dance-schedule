"use client";

import { useState } from "react";

type Member = {
  id: string;
  name: string;
};

type Props = {
  members: Member[];
};

export default function NameSelector({ members }: Props) {
  const [selectedId, setSelectedId] = useState("");

  const selectedMember = members.find((m) => m.id === selectedId);

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {/* 名前のドロップダウン */}
      <div className="flex flex-col gap-2">
        <label className="font-medium">名前を選んでください</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
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

      {/* 選択された名前を表示 */}
      {selectedMember && (
        <p className="text-gray-600">
          {selectedMember.name} さんの日程を入力してください
        </p>
      )}
    </div>
  );
}
