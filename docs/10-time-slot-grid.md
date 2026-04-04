# Step 10: 時間スロットグリッド

## 目標
- 配列から時間スロットの UI を生成する
- タップで範囲選択する操作を実装する
- `Record<string, string[]>` 型で日付→スロットのデータを管理する

---

## 作成・更新したファイル

```
components/
├── TimeSlotGrid.tsx  ← 新規: 時間スロットの表示・タップ操作
├── Calendar.tsx      ← 更新: props を activeDate/datesWithSlots/onSelectDate に変更
└── NameSelector.tsx  ← 更新: availabilities 状態・rangeStart 状態・handleSlotTap を追加
```

---

## Calendar の役割変更

Step 9 では「複数の日付を選択する」カレンダーだったが、Step 10 で役割が変わった。

| | Step 9 | Step 10 |
|---|---|---|
| props | `selectedDates`, `onToggle` | `activeDate`, `datesWithSlots`, `onSelectDate` |
| 日付タップの意味 | 選択/解除 | 「この日のスロットを編集する」 |
| 視覚的なフィードバック | 黒塗り | 黒塗り（activeDate）+ ドット（スロットあり） |

---

## 時間スロットの生成

```ts
const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30; // 9時間 = 540分 から30分ずつ増やす
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});
// → ["09:00", "09:30", "10:00", ..., "21:30"]
```

- `Math.floor(n / 60)` : 時間を取り出す（切り捨て除算）
- `n % 60` : 分を取り出す（余り）

---

## availabilities の型: Record\<string, string[]\>

```ts
const [availabilities, setAvailabilities] = useState<Record<string, string[]>>({});
```

`Record<string, string[]>` は「キーが文字列・値が文字列配列のオブジェクト」という型。

```ts
// 実際のデータのイメージ
{
  "2026-04-08": ["09:00", "09:30", "10:00"],
  "2026-04-10": ["19:00", "19:30", "20:00"],
}
```

日付ごとにスロットを独立して管理できる。

---

## タップで範囲選択のロジック

```ts
function handleSlotTap(slot: string) {
  const currentSlots = availabilities[activeDate] ?? [];

  if (rangeStart === null) {
    if (currentSlots.includes(slot)) {
      // パターンA: 選択済みをタップ → 解除
      setAvailabilities((prev) => ({
        ...prev,
        [activeDate]: currentSlots.filter((s) => s !== slot),
      }));
    } else {
      // パターンB: 未選択の1タップ目 → rangeStart を記録
      setRangeStart(slot);
    }
  } else {
    // パターンC: 2タップ目 → 範囲を選択
    const startIdx = TIME_SLOTS.indexOf(rangeStart);
    const endIdx = TIME_SLOTS.indexOf(slot);
    const [from, to] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
    const rangeSlots = TIME_SLOTS.slice(from, to + 1);
    setAvailabilities((prev) => ({
      ...prev,
      [activeDate]: [...new Set([...currentSlots, ...rangeSlots])],
    }));
    setRangeStart(null);
  }
}
```

### 3つのパターンをまとめると

```
タップしたスロットが…

選択済み → そのスロットを解除

未選択 + rangeStart が null
  → rangeStart = このスロット（グレーで強調表示）

未選択 + rangeStart がある
  → rangeStart〜このスロットの範囲を全部選択
  → rangeStart をリセット
```

### indexOf で位置を調べて slice で範囲を切り出す

```ts
TIME_SLOTS.indexOf("10:00")  // → 2（"10:00" は配列の2番目）
TIME_SLOTS.slice(2, 5)       // → ["10:00", "10:30", "11:00"]
```

上下どちらからタップしてもよいよう、`from` と `to` を小さい順に並べ直している。

```ts
const [from, to] = startIdx <= endIdx
  ? [startIdx, endIdx]   // 上→下にタップした場合
  : [endIdx, startIdx];  // 下→上にタップした場合
```

### `availabilities[activeDate] ?? []` の意味

```ts
const currentSlots = availabilities[activeDate] ?? [];
```

`availabilities` は日付をキーにしたオブジェクト。`availabilities[activeDate]` でその日のスロット配列を取り出す。

`??` は **Null 合体演算子**。左辺が `undefined` または `null` のとき、右辺の値を使う。

```ts
// この日付にまだスロットが選択されていない場合
availabilities["2026-04-08"]  // → undefined（キーが存在しない）
availabilities["2026-04-08"] ?? []  // → []（空配列にフォールバック）
```

その後の処理で `.includes()` や `.filter()` を呼ぶため、`undefined` のまま使うとエラーになる。`?? []` で必ず配列にしておく。

---

### `filter` による選択解除

```ts
[activeDate]: currentSlots.filter((s) => s !== slot),
```

`filter` は条件を満たす要素だけを残して新しい配列を作る。`s !== slot` は「タップされたスロット以外」という条件。

```ts
// 例: "10:00" をタップして解除する場合
currentSlots            // → ["09:00", "09:30", "10:00"]
.filter((s) => s !== "10:00")  // → ["09:00", "09:30"]
```

元の配列を直接変更せず、タップされたスロットを除いた**新しい配列**を作って state を更新する。

---

### `[activeDate]` による動的キーの更新

```ts
setAvailabilities((prev) => ({
  ...prev,
  [activeDate]: newSlots, // activeDate の値をキーとして使う
}));
```

`[activeDate]` は「変数の値をキーにする」書き方（計算プロパティ名）。
`activeDate = "2026-04-08"` なら `{ "2026-04-08": newSlots }` になる。

---

## 完了の確認
- [ ] 日付をタップするとスロット一覧が表示される
- [ ] スロットをタップするとグレーになる（rangeStart）
- [ ] 別のスロットをタップすると範囲が黒くなる
- [ ] 選択済みスロットをタップすると解除される
- [ ] 別の日付に移動して戻ると、その日の選択が保持されている
- [ ] スロットを選択した日付にドットが表示される
