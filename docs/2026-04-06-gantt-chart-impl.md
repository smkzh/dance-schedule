# ガントチャートUI実装メモ（2026-04-06）

## 変更・追加したファイル

```
├── lib/
│   └── calculateSlotAbsences.ts  ← 新規
├── components/
│   └── GanttChart.tsx            ← 新規
└── app/numbers/[id]/
    └── page.tsx                  ← 更新
```

---

## calculateSlotAbsences.ts

`calculateCandidates` の「日付ごとに最良の90分ウィンドウを1つ返す」とは異なり、
「振付者が空いている全スロットの欠席数」を日付ごとに返す。

### 返す型

```ts
type SlotInfo = {
  slot: string;          // "09:00"
  absences: number;      // 欠席人数
  absentNames: string[]; // 欠席者名
};

type DateSlots = {
  date: string;    // "2026-04-08"
  slots: SlotInfo[]; // 振付者が空いているスロットの一覧
};
```

### calculateCandidates との違い

| | calculateCandidates | calculateSlotAbsences |
|---|---|---|
| 返す単位 | 日付ごとに1件（最良ウィンドウ） | 日付ごとにスロット全件 |
| 用途 | 旧リスト表示 | ガントチャート表示 |

---

## GanttChart.tsx

クライアントコンポーネント。以下の state を持つ。

| state | 説明 |
|---|---|
| `year`, `month` | 表示中の月（◀▶で切り替え） |
| `threshold` | 欠席フィルターの閾値（ドロップダウン） |
| `tooltip` | ホバー/タップ中のスロット情報 |

### バーの色

欠席数に応じて明度を変える。

```ts
function absenceColor(absences: number, total: number): string {
  if (total === 0 || absences === 0) return "#000000";
  const ratio = absences / total;
  const lightness = Math.round(20 + ratio * 70); // 20%〜90%
  return `hsl(0, 0%, ${lightness}%)`;
}
```

- 欠席0人 → 黒（`#000000`）
- 欠席が増えるほど明度が上がり薄いグレーになる

### ツールチップ

- PC: `onMouseEnter` / `onMouseLeave` で表示/非表示
- スマホ: `onClick` でトグル

---

## 全日付の表示

`calculateSlotAbsences` は `availabilities` にデータがある日付だけを返す。
そのため `GanttChart` 側で表示中の月の全日付を生成し、データがない日は空行として表示する。

```ts
const daysInMonth = new Date(year, month, 0).getDate(); // その月の日数
const dateSlotsMap = Object.fromEntries(dateSlots.map((d) => [d.date, d]));
const allDatesInMonth = Array.from({ length: daysInMonth }, (_, i) => {
  const date = `${monthStr}-${String(i + 1).padStart(2, "0")}`;
  return dateSlotsMap[date] ?? { date, slots: [] }; // データなし → slots 空
});
```

`new Date(year, month, 0).getDate()` は「その月の最終日」を返す。
例: `new Date(2026, 4, 0).getDate()` → `30`（4月は30日まで）

### 行の表示パターン

| 状況 | 行の有無 | バーの有無 |
|---|---|---|
| 誰も日程提出していない | あり（空行） | なし |
| 誰かが提出したが振付者が空いていない | あり（空行） | なし |
| 振付者が空いており閾値以下のスロットがある | あり | あり |
| 振付者が空いているが全スロットが閾値超え | あり（空行） | なし |
