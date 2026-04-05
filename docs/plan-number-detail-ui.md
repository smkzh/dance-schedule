# 実装計画: ナンバー詳細ページ UI リニューアル

参照: `docs/number[id]-UI.jpg`

---

## 完成イメージ

```
2026 ◀ 4月 ▶                          欠席 ∨ 3人 まで表示

        9:00  10:00  11:00  12:00 ・・・
1日     ██████████                     ← 欠席0人(黒)
2日   ████████████                     ← 欠席1人(濃いグレー)
3日        ████████████                ← 欠席2人(中グレー)
4日        ██████                      ← 欠席3人(薄いグレー)
 :
```

- X軸: 時間（09:00〜21:30）
- Y軸: 日付（表示中の月の候補日）
- バー: スロットごとに色付き（欠席数に応じて濃淡）
- 1日のバーは複数色のセグメントになりうる
- ホバーで欠席者数・欠席者名のツールチップを表示
- 月ナビゲーション（◀ ▶ で前月・次月）
- 欠席フィルター（右上のドロップダウン）

---

## 色の定義

| 欠席数 | 色 |
|---|---|
| 0人 | 黒 `#000000` |
| 1人 | 濃いグレー `#444444` |
| 2人 | 中グレー `#888888` |
| 3人 | 薄いグレー `#bbbbbb` |
| 4人以上 | さらに薄く（欠席数に応じて算出） |

---

## 表示ルール

- 振付者が空いていないスロットは表示しない
- 欠席数がフィルターの閾値を超えるスロットは表示しない
- 閾値以下のスロットがない日は行を表示するがバーは空（練習不可の日も一覧に残す）

---

## 変更・追加するファイル

```
├── lib/
│   └── calculateSlotAbsences.ts  ← 新規: スロット別欠席数の計算
├── components/
│   └── GanttChart.tsx            ← 新規: ガントチャートUI（クライアントコンポーネント）
└── app/numbers/[id]/
    └── page.tsx                  ← 更新: 新しい計算関数とGanttChartを使う
```

---

## 新しい計算関数: calculateSlotAbsences

### 返すデータの型

```ts
type SlotInfo = {
  slot: string;        // "09:00"
  absences: number;    // 欠席人数
  absentNames: string[]; // 欠席者名
};

type DateSlots = {
  date: string;        // "2026-04-08"
  slots: SlotInfo[];   // 閾値フィルタ前の全スロット情報
};
```

### 計算の流れ

```
① slotMap を作る（calculateCandidates と同じ）
        ↓
② 日付を全列挙
        ↓
③ 日付ごとに:
    - 振付者が空いているスロットを求める
    - 振付者が空いている各スロットについて欠席者を数える
    - SlotInfo の配列を作る
        ↓
④ DateSlots[] を返す
```

---

## GanttChart コンポーネント

クライアントコンポーネント。state として以下を持つ。

| state | 型 | 説明 |
|---|---|---|
| `currentMonth` | `{ year: number; month: number }` | 表示中の月 |
| `threshold` | `number` | 欠席フィルターの閾値 |
| `tooltip` | `{ slot: SlotInfo; x: number; y: number } \| null` | ホバー中のツールチップ |

### props

```ts
type Props = {
  dateSlots: DateSlots[];
  totalMembers: number; // フィルタの最大値（非振付者の人数）
};
```

### 表示の仕組み

- 時間軸の幅 = コンテナの幅を TIME_SLOTS の数で割る
- バーの left = (スロットのインデックス / TIME_SLOTS.length) × 100%
- バーの width = 1スロット分の幅
- 同じ日の隣接するスロットは視覚的につながって見える

---

## 実装手順

1. `lib/calculateSlotAbsences.ts` を作成する
2. `app/numbers/[id]/page.tsx` で `calculateSlotAbsences` を呼び出し、結果を `GanttChart` に渡す
3. `components/GanttChart.tsx` を作成する
   - 月ナビゲーション
   - 欠席フィルタードロップダウン
   - タイムライン描画（スロットごとの色付きバー）
   - ホバーツールチップ

---

## 決定事項

- 時間軸ラベルは1時間おきに表示する（9:00, 10:00, 11:00...）
- PCではホバー、スマホではタップでツールチップを表示する
