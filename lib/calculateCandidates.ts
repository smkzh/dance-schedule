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

export type Candidate = {
  date: string;
  rangeStart: string; // 振り付け者の最初の空きスロット
  rangeEnd: string;   // 振り付け者の最後の空きスロット
  minAbsences: number;
  absentNames: string[];
};

export function calculateCandidates(
  availabilities: Availability[],
  numberMembers: NumberMember[]
): Candidate[] {
  const choreographers = numberMembers.filter((nm) => nm.is_choreographer);
  const nonChoreographers = numberMembers.filter((nm) => !nm.is_choreographer);

  // 「メンバーID:日付」をキーにしたスロットのセットを作る
  const slotMap: Record<string, Set<string>> = {};
  for (const row of availabilities) {
    const slot = row.time_slot.slice(0, 5); // "09:00:00" → "09:00"
    const key = `${row.member_id}:${row.available_date}`;
    if (!slotMap[key]) slotMap[key] = new Set();
    slotMap[key].add(slot);
  }

  // 日程提出がある日付を全て列挙する
  const allDates = [...new Set(availabilities.map((r) => r.available_date))].sort();

  const candidates: Candidate[] = [];

  for (const date of allDates) {
    // 振り付け者全員が空いているスロットを求める（複数の場合は積集合）
    const choreographerSlots = choreographers.reduce<Set<string>>(
      (acc, c, idx) => {
        const slots = slotMap[`${c.members.id}:${date}`] ?? new Set<string>();
        if (idx === 0) return slots;
        return new Set([...acc].filter((s) => slots.has(s)));
      },
      new Set()
    );

    // 振り付け者が1スロットも空いていない日はスキップ
    if (choreographerSlots.size === 0) continue;

    const sortedSlots = [...choreographerSlots].sort();
    const rangeStart = sortedSlots[0];
    const rangeEnd = sortedSlots[sortedSlots.length - 1];

    // 振り付け者が空いている範囲で 90 分ウィンドウ（3スロット連続）を探す
    let minAbsences = Infinity;
    let bestAbsentNames: string[] = [];

    for (let i = 0; i <= TIME_SLOTS.length - 3; i++) {
      const window = [TIME_SLOTS[i], TIME_SLOTS[i + 1], TIME_SLOTS[i + 2]];

      // 振り付け者が3スロット全て空いていなければスキップ
      if (!window.every((s) => choreographerSlots.has(s))) continue;

      // このウィンドウで欠席になるメンバーを数える
      const absentMembers = nonChoreographers.filter((nm) => {
        const memberSlots = slotMap[`${nm.members.id}:${date}`] ?? new Set();
        return !window.every((s) => memberSlots.has(s));
      });

      if (absentMembers.length < minAbsences) {
        minAbsences = absentMembers.length;
        bestAbsentNames = absentMembers.map((nm) => nm.members.name);
      }
    }

    // 90 分ウィンドウが1つもなかった日はスキップ
    if (minAbsences === Infinity) continue;

    candidates.push({ date, rangeStart, rangeEnd, minAbsences, absentNames: bestAbsentNames });
  }

  // 欠席数の少ない順に並べる
  return candidates.sort((a, b) => a.minAbsences - b.minAbsences);
}
