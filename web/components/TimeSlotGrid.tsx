"use client";

import { TIME_SLOTS } from "@/lib/timeSlots";

type Props = {
  selectedSlots: string[];   // 選択済みのスロット
  rangeStart: string | null; // 1タップ目で選んだスロット（null = 未選択）
  onTap: (slot: string) => void;
};

export default function TimeSlotGrid({ selectedSlots, rangeStart, onTap }: Props) {
  return (
    <div className="flex flex-col w-full max-w-sm border border-gray-200 rounded-lg overflow-hidden">
      {TIME_SLOTS.map((slot) => {
        const isSelected = selectedSlots.includes(slot);
        const isRangeStart = slot === rangeStart;

        return (
          <button
            key={slot}
            onClick={() => onTap(slot)}
            className={`flex items-center gap-4 px-4 py-2 text-sm border-b border-gray-100 last:border-b-0 transition-colors
              ${isSelected ? "bg-black text-white" : ""}
              ${isRangeStart ? "bg-gray-400 text-white" : ""}
              ${!isSelected && !isRangeStart ? "hover:bg-gray-50 text-gray-800" : ""}
            `}
          >
            <span className="w-12 text-left font-mono">{slot}</span>
            <span
              className={`flex-1 h-5 rounded ${
                isSelected ? "bg-white/20" : isRangeStart ? "bg-white/20" : "bg-gray-100"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export { TIME_SLOTS };
