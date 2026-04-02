# Step 11: 日程の提出・再提出・復元

## 目標
- DELETE + INSERT で上書き保存する方法を理解する
- `useEffect` でデータを取得して画面に復元する
- `flatMap` でネストした配列を平坦にする方法を理解する

---

## 作成・更新したファイル

```
├── app/api/submit/
│   └── route.ts        ← 新規: 日程保存APIルート
└── components/
    └── NameSelector.tsx ← 更新: useEffect・handleSubmit・提出ボタンを追加
```

---

## 保存の方針: DELETE → INSERT

`availabilities` テーブルには同じメンバーの行が何行でも入れられる。
再提出時に「変更があった行だけ更新」するのは複雑なので、
**一度全削除してから全件 INSERT** するシンプルな方針にしている。

```
① member_id = xxx のデータを全件 DELETE
② 新しいデータを全件 INSERT
```

---

## flatMap でネストした配列を平坦にする

`availabilities` は日付ごとにスロットの配列を持つ入れ子構造。
INSERT には1行ずつのオブジェクト配列が必要なので変換する。

```ts
const rows = Object.entries(availabilities).flatMap(([date, slots]) =>
  slots.map((slot) => ({
    member_id: memberId,
    available_date: date,
    time_slot: slot,
  }))
);
```

### Object.entries で日付とスロット配列のペアを取り出す

```ts
Object.entries({
  "2026-04-08": ["09:00", "09:30"],
  "2026-04-10": ["19:00"],
})
// → [["2026-04-08", ["09:00", "09:30"]], ["2026-04-10", ["19:00"]]]
```

### map で各スロットをオブジェクトに変換すると配列の配列になる

```ts
.map(([date, slots]) => slots.map((slot) => ({ ... })))
// → [
//     [{ date: "2026-04-08", slot: "09:00" }, { date: "2026-04-08", slot: "09:30" }],
//     [{ date: "2026-04-10", slot: "19:00" }],
//   ]
```

### flatMap は map + flat(1) で1段階だけ平坦にする

```ts
.flatMap(([date, slots]) => slots.map((slot) => ({ ... })))
// → [
//     { date: "2026-04-08", slot: "09:00" },
//     { date: "2026-04-08", slot: "09:30" },
//     { date: "2026-04-10", slot: "19:00" },
//   ]
```

---

## useEffect で既存データを復元する

```ts
useEffect(() => {
  if (!selectedId) return;

  async function fetchExisting() {
    const { data } = await supabase
      .from("availabilities")
      .select("available_date, time_slot")
      .eq("member_id", selectedId);

    if (!data || data.length === 0) return;

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
}, [selectedId]); // ← selectedId が変わるたびに実行される
```

### useEffect とは

コンポーネントが描画された後に実行したい処理を登録する仕組み。

```ts
useEffect(() => {
  // 実行したい処理
}, [依存配列]);
```

**依存配列**に指定した値が変わるたびに処理が再実行される。
`[selectedId]` と書くことで「名前が変わったとき」だけ実行される。

### time_slot の変換

Supabase の `time` 型は `"09:00:00"` という秒まで含む形式で返ってくる。
アプリ内では `"09:00"` の形式を使っているので、先頭5文字だけ取り出す。

```ts
"09:00:00".slice(0, 5)  // → "09:00"
```

### for...of でオブジェクトに変換

```ts
const restored: Record<string, string[]> = {};
for (const row of data) {
  if (!restored[row.available_date]) restored[row.available_date] = [];
  restored[row.available_date].push(row.time_slot.slice(0, 5));
}
```

日付ごとにスロットを配列にまとめる処理。
`if (!restored[date])` で「まだキーがなければ空配列を作る」という初期化。

---

## 処理の全体像

```
【名前を選択したとき】
  useEffect が発火
    ↓
  Supabase から既存データを取得
    ↓
  setAvailabilities で状態を復元
    ↓
  カレンダーにドットが表示される

【「提出する」ボタンを押したとき】
  handleSubmit が呼ばれる
    ↓
  POST /api/submit にデータを送る
    ↓
  route.ts: DELETE → INSERT
    ↓
  成功 →「提出しました」を表示
```

---

## 完了の確認
- [ ] 日程を選択して「提出する」を押すと「提出しました」と表示される
- [ ] Supabase の Table Editor に availabilities のデータが入っている
- [ ] 一度提出後、名前を選び直すと前回の選択が復元される
- [ ] 修正して再提出すると Supabase のデータが上書きされる
