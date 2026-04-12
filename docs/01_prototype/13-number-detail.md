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

## force-dynamic とは

```ts
export const dynamic = "force-dynamic";
```

Next.js はデフォルトで、ページを**ビルド時に静的生成**しようとする。
静的生成とは「あらかじめ HTML を作っておく」こと。

しかし Supabase を使うページは、アクセスのたびに最新データを取得する必要がある。
ビルド時に Supabase へ接続しに行くと接続がハングしてデプロイが失敗する。

`force-dynamic` を設定すると「ユーザーがアクセスしたときにデータを取得する」動作になる。

```
デフォルト（静的生成）: ビルド時に HTML を作る → Supabase 接続がハングしてデプロイ失敗
force-dynamic        : アクセス時にデータを取得 → 毎回最新のデータが表示される
```

---

## 動的ルートとパラメータの受け取り方

### 動的ルートとは

フォルダ名が `[id]` のページは、URL の一部を変数として受け取れる。

```
/numbers/abc-123  → id = "abc-123"
/numbers/xyz-456  → id = "xyz-456"
```

`/numbers/page.tsx`（固定URL）と違い、`[id]` は「何でも受け取る」ページ。

---

### params の受け取り方

動的ルートのページは `params` を引数として受け取る。

```tsx
// 普通のページ（引数なし）
export default async function Page() { ... }

// 動的ルートのページ（params を受け取る）
export default async function NumberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) { ... }
```

`{ params, }` は**引数の分割代入**。関数に渡されるオブジェクトから `params` だけを取り出している。末尾の `,` はあってもなくても動作は同じ（フォーマッターが自動で付けることが多い）。

`}:` の `}` が分割代入の終わり、`:` の後ろが型注釈。

---

### 分割代入とは

オブジェクトから特定のキーだけを取り出して変数にする書き方。

```ts
// 普通の書き方
const id = params.id;

// 分割代入（同じ意味）
const { id } = params;
```

関数の引数でも同様に使える。

```tsx
// 普通の書き方
function Page(props) {
  const params = props.params;
}

// 引数で分割代入（同じ意味）
function Page({ params }) {
  // params が直接使える
}
```

---

### ページコンポーネントが受け取れる引数

Next.js のページコンポーネントには `params` の他に `searchParams` も渡される。

```tsx
// 受け取れるもの全部書くとこうなる
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}) { ... }
```

`searchParams` は URL の `?key=value` の部分（例: `/search?q=ダンス` の `q=ダンス`）。

ページをリロードしても状態を保持したいときや、URLを共有したときに同じ表示にしたいときに使う。

```
// 用途の例
/members?sort=name        → 名前順で並び替え
/schedule?date=2026-04-08 → 特定の日付を開いた状態で共有
/search?q=ダンス           → 検索キーワードをURLに含める
```

`useState` で管理する状態はリロードすると消えるが、`searchParams` に入れておくと URL を共有するだけで同じ状態を再現できる。

普通のページでは両方不要なので全部省略できる。

```tsx
// params も searchParams も使わない場合は省略
export default async function Page() { ... }
```

`[id]` のページだけ URL から id を取り出す必要があるため `params` を受け取っている。

---

### `await params` が必要な理由

```ts
const { id } = await params;
```

Next.js 15 以降、`params` が非同期（Promise）になった。以前は `params.id` で直接取れたが、今は `await` してから取り出す必要がある。

```
URL: /numbers/abc-123
         ↓
params = Promise<{ id: "abc-123" }>
         ↓ await
{ id: "abc-123" }
         ↓ 分割代入
id = "abc-123"
```

---

## as any とは

```ts
number.number_members as any
```

TypeScript の**型キャスト**で、「この値の型チェックを無視する」という意味。

`calculateCandidates` は `NumberMember[]` 型を期待しているが、Supabase が返す `number.number_members` の型推論では `members` が単一オブジェクトではなく配列として判定されてしまい、TypeScript がエラーを出す。

```ts
// calculateCandidates が期待する型
members: { id: string; name: string }    // オブジェクト

// Supabase の型推論が返す型
members: { id: string; name: string }[]  // 配列（← TypeScript がエラーを出す）
```

実際のデータは正しくオブジェクトとして返ってくるが、TypeScript の型推論がズレているだけ。`as any` で型チェックを強制的に通過させている。

`any` は「どんな型でも許容する」特殊な型。型安全性を犠牲にするため本来は避けるべきだが、Supabase の型推論と自前の型定義がズレているときの応急処置として使っている。

---

## 候補日の計算ロジック（calculateCandidates.ts）

### 関数の戻り値の型注釈

```ts
export function calculateCandidates(
  availabilities: Availability[],
  numberMembers: NumberMember[]
): Candidate[] {
```

引数の型注釈は `引数名: 型` の形で書くが、戻り値の型注釈は `)` の後ろに `: 型` を書く。

```ts
function 関数名(引数: 型): 戻り値の型 { ... }
```

`): Candidate[]` は「この関数は `Candidate` の配列を返す」という意味。省略しても TypeScript が推論してくれるが、明示することで意図が伝わりやすくなる。

---

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
