# Step 9: カレンダーコンポーネント

## 目標
- JavaScript の Date オブジェクトの基本を理解する
- 配列から UI のマス目を生成する方法を理解する
- 親子コンポーネント間の状態の受け渡し方を理解する

---

## 作成・更新したファイル

```
components/
├── Calendar.tsx      ← 新規: カレンダー表示・日付選択
└── NameSelector.tsx  ← 更新: selectedDates 状態を追加・Calendar を組み込む
```

---

## コンポーネントの構成

```
NameSelector.tsx（状態を持つ）
  │
  │  selectedDates, toggleDate を props で渡す
  │
  └─▶ Calendar.tsx（表示・操作を担当）
```

日付の選択状態（`selectedDates`）は `NameSelector` が持つ。
`Calendar` はその状態を受け取って表示し、タップ時に `onToggle` を呼ぶだけ。

**なぜ Calendar が状態を持たないか**

後のステップで「選択された日付を Supabase に保存する」処理を `NameSelector` に書く。
`Calendar` が状態を持ってしまうと、その値を取り出すのが難しくなる。
使われる側（Calendar）は「表示と通知」だけ担当し、管理は親（NameSelector）に任せる。

---

## JavaScript の Date オブジェクト

```ts
const today = new Date();               // 現在日時
today.getFullYear()                     // 年: 2026
today.getMonth()                        // 月: 0〜11（0=1月、注意）
today.getDate()                         // 日: 1〜31
today.getDay()                          // 曜日: 0〜6（0=日曜）
```

### 月の1日が何曜日かを調べる

```ts
new Date(year, month, 1).getDay()
// 例: 2026年4月1日 → 3（水曜）
```

カレンダーの最初に空白マスを何個置くかを決めるために使う。

### その月の日数を調べる

```ts
new Date(year, month + 1, 0).getDate()
// 「次の月の0日目」= 今月の最終日
// 例: 2026年4月 → 30
```

`0日` という指定で「前の月の最終日」が返る仕組みを利用している。

---

## カレンダーのマス目を生成する

```ts
const cells = [
  ...Array(firstDayOfWeek).fill(null), // 月初の空白マス
  ...Array.from({ length: daysInMonth }, (_, i) => i + 1), // 1〜末日
];
```

例: 2026年4月（1日=水曜=3）

```
[null, null, null, 1, 2, 3, 4, 5, 6, 7, ...]
 日     月     火  水  木  金  土
```

### Array(n).fill(null)

```ts
Array(3).fill(null)
// → [null, null, null]
```

`n` 個の `null` が入った配列を作る。空白マス用。

### Array.from({ length: n }, (_, i) => i + 1)

```ts
Array.from({ length: 5 }, (_, i) => i + 1)
// → [1, 2, 3, 4, 5]
```

1〜n の数字の配列を作る。日付のマス用。

`Array.from` の引数は2つ：

- **第1引数 `{ length: n }`** : 長さ n の配列を作ることを指示する
- **第2引数 `(_, i) => i + 1`** : 各要素を生成する関数。第1引数は要素の値（今回は不要なので `_` と書いて無視）、第2引数 `i` はインデックス（0始まり）

```ts
// i = 0, 1, 2, 3, 4 の順に呼ばれる
(_, i) => i + 1
// → 1, 2, 3, 4, 5
```

`_` は「使わない引数」の慣習的な書き方。

#### map が渡す引数について

`map`（および `Array.from` の第2引数）は、常に3つの値を渡している。

```ts
array.map((element, index, originalArray) => ...)
//         要素の値   インデックス  元の配列
```

受け取る変数の数はこちらが決めるだけで、インデックスは宣言しなくても常に渡されている。

```ts
array.map((day) => ...)        // インデックスは来ているが受け取っていない
array.map((day, i) => ...)     // インデックスも受け取る
array.map((_, i) => ...)       // 要素の値は使わず、インデックスだけ受け取る
```

23行目の `(_, i) => i + 1` は「要素の値は不要、インデックスだけ使う」という意味になる。

---

## 日付文字列の生成（padStart）

```ts
function toDateString(day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}
```

`padStart(2, "0")` は「2桁になるよう左に "0" を埋める」という意味。

```ts
String(4).padStart(2, "0")   // → "04"
String(12).padStart(2, "0")  // → "12"（すでに2桁なので変わらない）
```

こうして `"2026-04-08"` のような統一された形式にする。

---

## 前月・次月への移動

```ts
function prevMonth() {
  if (month === 0) {       // 1月のとき
    setYear((y) => y - 1); // 年を1つ前に
    setMonth(11);           // 月を12月に
  } else {
    setMonth((m) => m - 1);
  }
}
```

`setMonth((m) => m - 1)` のように **関数を渡す**書き方は、
直前の状態の値を使って更新したいときに使う。
`setMonth(month - 1)` でも動くが、関数渡しの方が確実（React の推奨）。

---

## トグルとは

「押すたびにON/OFFが切り替わる」操作・UIのこと。
電灯のスイッチのように、同じ操作で状態が反転する。

```
タップ前: ○（未選択）  →  タップ: ●（選択済み）
タップ前: ●（選択済み）→  タップ: ○（未選択）
```

カレンダーの日付ボタンがこれにあたる。
同じボタンを押すことで選択・解除を切り替えられるため、操作がシンプルになる。

---

## 日付の選択・解除（toggleDate）

```ts
function toggleDate(date: string) {
  setSelectedDates((prev) =>
    prev.includes(date)
      ? prev.filter((d) => d !== date) // 選択済みなら除去
      : [...prev, date]                // 未選択なら追加
  );
}
```

- `prev.includes(date)` : 配列に `date` が含まれるか確認
- `prev.filter((d) => d !== date)` : `date` 以外の要素だけ残した新しい配列を作る
- `[...prev, date]` : `prev` の末尾に `date` を追加した新しい配列を作る

---

## props でコールバックを渡す（onToggle）

```tsx
// NameSelector.tsx（親）
<Calendar selectedDates={selectedDates} onToggle={toggleDate} />

// Calendar.tsx（子）
type Props = {
  selectedDates: string[];
  onToggle: (date: string) => void; // 「文字列を受け取って何も返さない関数」という型
};

// 子の中でボタンを押したら親の関数を呼ぶ
<button onClick={() => onToggle(dateStr)}>
```

子コンポーネントが「何かが起きた」ことを親に伝える手段が **コールバック関数の props**。
子は `onToggle` を呼ぶだけで、実際の処理（状態の更新）は親が行う。

---

## 完了の確認
- [ ] `/submit` で名前を選ぶとカレンダーが表示される
- [ ] ◀ ▶ で前月・次月に移動できる
- [ ] 日付をタップすると黒く塗りつぶされる
- [ ] もう一度タップすると選択が解除される
- [ ] 「N日選択中」の数字が変わる
- [ ] 名前を変えると日付の選択がリセットされる
