import { TIME_SLOTS } from "@/lib/timeSlots";

type Availability = {
  member_id: string;
  available_date: string;
  time_slot: string;
};

type NumberMember = {
  is_choreographer: boolean;
  members: { id: string; name: string };
};

export type SlotInfo = {
  slot: string;
  absences: number;
  absentNames: string[];
};

export type DateSlots = {
  date: string;
  slots: SlotInfo[]; // 振付者が空いているスロットのみ（欠席数フィルタ前）
};

export function calculateSlotAbsences(
  availabilities: Availability[],
  numberMembers: NumberMember[]
): DateSlots[] {
  const choreographers = numberMembers.filter((nm) => nm.is_choreographer);
  const nonChoreographers = numberMembers.filter((nm) => !nm.is_choreographer);

  // 「メンバーID:日付」をキーにしたスロットのセットを作る
  const slotMap: Record<string, Set<string>> = {};
  for (const row of availabilities) {
    const slot = row.time_slot.slice(0, 5);
    const key = `${row.member_id}:${row.available_date}`;
    if (!slotMap[key]) slotMap[key] = new Set();
    slotMap[key].add(slot);
  }

  // 日程提出がある日付を全て列挙する
  const allDates = [...new Set(availabilities.map((r) => r.available_date))].sort();

  const result: DateSlots[] = [];

  for (const date of allDates) {
    // 振付者全員が空いているスロットを求める
    const choreographerSlots = choreographers.reduce<Set<string>>(
      (acc, c, idx) => {
        const slots = slotMap[`${c.members.id}:${date}`] ?? new Set<string>();
        if (idx === 0) return slots;
        return new Set([...acc].filter((s) => slots.has(s)));
      },
      new Set()
    );

    // 振付者が空いている各スロットについて欠席者を計算する
    const slots: SlotInfo[] = TIME_SLOTS.filter((slot) =>
      choreographerSlots.has(slot)
    ).map((slot) => {
      const absentMembers = nonChoreographers.filter((nm) => {
        const memberSlots = slotMap[`${nm.members.id}:${date}`] ?? new Set();
        return !memberSlots.has(slot);
      });
      return {
        slot,
        absences: absentMembers.length,
        absentNames: absentMembers.map((nm) => nm.members.name),
      };
    });

    result.push({ date, slots });
  }

  return result;
}
