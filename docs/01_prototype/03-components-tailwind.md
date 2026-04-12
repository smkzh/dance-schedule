# Step 3: コンポーネントと Tailwind CSS

## 目標
- React コンポーネントと props の仕組みを理解する
- Tailwind CSS の書き方を理解する
- レスポンシブデザインを実装する

---

## 作成・更新したファイル

```
├── components/
│   └── LinkButton.tsx   ← 新規: 再利用できるリンクボタン部品
└── app/
    └── page.tsx         ← 更新: LinkButton を使い、レスポンシブ対応
```

---

## コンポーネントとは

画面の「部品」を関数として定義したもの。
一度作れば複数の場所で使い回せる。

```tsx
// components/LinkButton.tsx
export default function LinkButton({ href, children, variant }) {
  return <Link href={href}>...</Link>
}

// 使う側
<LinkButton href="/submit">日程を提出する</LinkButton>
<LinkButton href="/numbers">候補日を確認する</LinkButton>
```

同じ見た目のボタンを2つ書くより、コンポーネントにまとめた方が：
- 修正がひとか所で済む
- コードが読みやすくなる

---

## props とは

コンポーネントに渡す「引数」のこと。
HTML の属性と似た書き方で渡す。

```tsx
// 渡す側（使う側）
<LinkButton href="/submit" variant="primary">
  日程を提出する       ← これが children
</LinkButton>

// 受け取る側（コンポーネント定義）
type Props = {
  href: string;                      // 必須: リンク先URL
  children: React.ReactNode;         // 必須: ボタンの中身（テキストなど）
  variant?: "primary" | "secondary"; // 任意: ボタンの種類（省略可）
};

function LinkButton({ href, children, variant = "primary" }: Props) {
  // href, children, variant が使える
}
```

### `?` と デフォルト値

```tsx
variant?: "primary" | "secondary"  // ? がついているので省略可能
variant = "primary"                // 省略されたときは "primary" になる
```

### `children` とは

タグの中に書いたものが `children` として渡される。

```tsx
<LinkButton href="/submit">日程を提出する</LinkButton>
//                         ↑ これが children
```

---

## Tailwind CSS の書き方

クラス名を `className` に書くだけでスタイルが当たる。

```tsx
<div className="flex flex-col gap-4 p-8 bg-black text-white rounded-lg">
```

### よく使うクラス

| クラス | 意味 |
|---|---|
| `flex` | display: flex |
| `flex-col` | 縦方向に並べる |
| `flex-row` | 横方向に並べる |
| `items-center` | 交差軸方向に中央揃え |
| `justify-center` | 主軸方向に中央揃え |
| `gap-4` | 要素間の間隔（4 = 1rem = 16px） |
| `p-8` | padding（8 = 2rem = 32px） |
| `w-full` | 幅 100% |
| `h-12` | 高さ（12 = 3rem = 48px） |
| `rounded-lg` | 角を丸くする |
| `font-medium` | フォントの太さ |
| `text-white` | 文字色: 白 |
| `bg-black` | 背景色: 黒 |
| `border` | 枠線 |
| `hover:opacity-80` | ホバー時に透明度を下げる |

---

## レスポンシブデザイン

Tailwind では `sm:` などのプレフィックスで画面幅に応じたスタイルを書ける。

```
（プレフィックスなし）  → 常に適用（モバイルファースト）
sm:                    → 640px 以上で適用
md:                    → 768px 以上で適用
lg:                    → 1024px 以上で適用
```

### 今回のホームページの例

```tsx
{/* モバイル: 縦並び(flex-col) / sm以上: 横並び(flex-row) */}
<div className="flex flex-col gap-4 sm:flex-row">
  <LinkButton href="/submit" variant="primary">日程を提出する</LinkButton>
  <LinkButton href="/numbers" variant="secondary">候補日を確認する</LinkButton>
</div>
```

```
モバイル（〜639px）:        PC（640px〜）:
┌──────────────┐           ┌──────────┐ ┌──────────┐
│ 日程を提出する │           │日程を提出 │ │ 候補日を │
├──────────────┤           │  する    │ │ 確認する │
│ 候補日を確認  │           └──────────┘ └──────────┘
└──────────────┘
```

### 確認方法

ブラウザの開発者ツール（F12）→ デバイスアイコン でスマホ表示に切り替えられる。

---

## TypeScript の型

```tsx
type Props = {
  href: string;                       // 文字列のみ
  children: React.ReactNode;          // JSX や文字列など何でも
  variant?: "primary" | "secondary";  // この2つの文字列のみ
};
```

`"primary" | "secondary"` は「primary か secondary のどちらかのみ受け付ける」という意味。
それ以外の文字列を渡すとコンパイルエラーになるので、バグを防げる。

---

## 完了の確認
- [ ] `http://localhost:3005` でホームページが表示される
- [ ] ブラウザの幅を狭めるとボタンが縦並びになる
- [ ] ブラウザの幅を広げる（640px 以上）とボタンが横並びになる
