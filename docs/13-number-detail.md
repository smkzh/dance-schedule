# Step 13: 候補日の計算と表示（ナンバー別ビュー）

## 目標
- 複数テーブルのデータを組み合わせて集計する処理を理解する
- 計算ロジックを `lib/` に分離してページをシンプルに保つ設計を理解する

---

## 作成・更新したファイル

```
├── lib/
│   └── calculateCandidates.ts  ← 新規: 候補日計算ロジック
└── app/numbers/[id]/
    └── page.tsx                ← 更新: 候補日を取得・表示
```

---

## 候補日の計算ロジック（calculateCandidates.ts）

### 全体の流れ

```
① availabilities を「メンバーID:日付」をキーにしたマップに変換
        ↓
② 日程提出がある日付を全列挙
        ↓
③ 日付ごとに:
    - 振り付け者が空いているスロットを求める
    - 空きがなければスキップ
    - 90分ウィンドウを全探索して最小欠席数を求める
    - 90分ウィンドウがなければスキップ
        ↓
④ 欠席数の少ない順にソート
```

---

### スロットマップの作り方

Supabase から返ってくる配列を、素早く検索できるマップに変換する。

```ts
// 変換前（Supabase の返り値）
[
  { member_id: "aaa", available_date: "2026-04-08", time_slot: "09:00:00" },
  { member_id: "aaa", available_date: "2026-04-08", time_slot: "09:30:00" },
  { member_id: "bbb", available_date: "2026-04-08", time_slot: "10:00:00" },
]

// 変換後（マップ）
{
  "aaa:2026-04-08": Set { "09:00", "09:30" },
  "bbb:2026-04-08": Set { "10:00" },
}
```

`Set` を使うのは、`set.has("09:00")` が配列の `includes` より高速なため。
ループの中で何度も呼ばれる検索処理に向いている。

---

### 振り付け者スロットの積集合（reduce）

振り付け者が複数いる場合、全員が空いているスロットだけを使う。

```ts
const choreographerSlots = choreographers.reduce<Set<string>>(
  (acc, c, idx) => {
    const slots = slotMap[`${c.members.id}:${date}`] ?? new Set<string>();
    if (idx === 0) return slots;                              // 1人目: そのまま返す
    return new Set([...acc].filter((s) => slots.has(s)));    // 2人目以降: 積集合
  },
  new Set()
);
```

**積集合**とは「両方に含まれる要素だけを残す」操作。

```ts
// 振り付け者A: { "09:00", "10:00", "11:00" }
// 振り付け者B: { "10:00", "11:00", "12:00" }
// 積集合    : { "10:00", "11:00" }  ← 両方が空いている時間だけ
```

---

### 90分ウィンドウの全探索

```ts
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
```

- `TIME_SLOTS.length - 3` まで回すのは、最後の3スロット分をはみ出さないため
- 振り付け者が空いていない窓は `continue` で飛ばす
- `every` は「全ての要素が条件を満たすか」を確認する

---

### every と some

```ts
// every: 全員が条件を満たす場合に true
["09:00", "09:30", "10:00"].every((s) => choreographerSlots.has(s))
// → 3スロット全て振り付け者が空いているか

// some: 1つでも条件を満たす場合に true
["09:00", "09:30", "10:00"].some((s) => choreographerSlots.has(s))
// → 1スロットでも振り付け者が空いているか
```

---

### Infinity の使い方

```ts
let minAbsences = Infinity; // 無限大で初期化
```

最初は「まだ比較していない」状態を表すために `Infinity` を使う。
どんな欠席数も `Infinity` より小さいので、最初の窓で必ず更新される。

ループ後に `minAbsences === Infinity` なら「有効な窓がなかった」と判断できる。

---

## ロジックを lib/ に分離する理由

```
app/numbers/[id]/page.tsx  → データ取得・表示のみ担当
lib/calculateCandidates.ts → 計算ロジックのみ担当
```

計算ロジックをページに書いてしまうと：
- ページが長くなって読みにくい
- 同じロジックを Step 13-2 でも使いたいときに重複する

`lib/` に分離することで、Step 13-2 の `/schedule` ページからも
`calculateCandidates` を `import` して使い回せる。

---

## 完了の確認
- [ ] `/numbers/[id]` で候補日一覧が表示される
- [ ] 各候補に「日付・時間帯・欠席数」が表示される
- [ ] 欠席者がいる場合は名前が表示される
- [ ] 欠席数の少ない順に並んでいる
- [ ] 振り付け者が不参加の日は表示されない
