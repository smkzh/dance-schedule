# Step 6: CSV ファイルをアップロードしてパースする

## 目標
- フォームと `<input type="file">` の使い方を理解する
- CSV を JavaScript でパースする方法を理解する
- `useState` でフォームの状態を管理する

---

## 更新したファイル

```
web/app/admin/upload/page.tsx  ← Client Component として全面更新
```

---

## フォームの作り方

HTML の `<form>` タグを使ってユーザーの入力を受け取る。

```tsx
<form onSubmit={handleSubmit}>
  <input type="text" />        {/* テキスト入力 */}
  <input type="file" />        {/* ファイル選択 */}
  <button type="submit">送信</button>
</form>
```

### `onSubmit` と `e.preventDefault()`

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); // ← ページのリロードを防ぐ（必須）
  // 処理を書く
}
```

通常フォームを送信するとページがリロードされる。
`e.preventDefault()` でそれを止めて、JavaScript で処理できるようにする。

### ファイルの取得方法

```tsx
const input = form.elements.namedItem("membersFile") as HTMLInputElement;
const file = input.files?.[0]; // 選択されたファイルの1つ目
```

- `form.elements.namedItem("membersFile")` : `name="membersFile"` の要素を取得
- `files?.[0]` : ファイルが選択されていれば1つ目を取得（`?` はnullチェック）

### ファイルをテキストとして読む

```tsx
const text = await file.text(); // ファイルの中身を文字列で取得
```

`await` を使うので、関数に `async` が必要。

---

## CSVのパース

CSVは「カンマ区切りのテキスト」。これをJavaScriptのオブジェクト配列に変換する。

```
// CSVファイルの中身
member_name
田中花子
鈴木太郎
```

```tsx
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");      // 行に分割
  const headers = lines[0].split(",")         // 1行目はヘッダー
                           .map(h => h.trim());

  return lines.slice(1).map((line) => {       // 2行目以降がデータ
    const values = line.split(",").map(v => v.trim());
    return Object.fromEntries(                // キーと値のペアを作る
      headers.map((h, i) => [h, values[i] ?? ""])
    );
  });
}
```

変換後のイメージ：

**members.csv の場合**
```ts
// 変換前（文字列）
"member_name\n田中花子\n鈴木太郎"

// 変換後（オブジェクト配列）
[
  { member_name: "田中花子" },
  { member_name: "鈴木太郎" },
]
```

**numbers.csv の場合**（カラムが複数あっても同じ仕組みで変換される）
```ts
// 変換前（文字列）
"number_name,choreographer,member_name\nナンバーA,田中花子,田中花子\nナンバーA,田中花子,鈴木太郎"

// 変換後（オブジェクト配列）
[
  { number_name: "ナンバーA", choreographer: "田中花子", member_name: "田中花子" },
  { number_name: "ナンバーA", choreographer: "田中花子", member_name: "鈴木太郎" },
]
```

---

## useState でフォームの状態を管理する

```tsx
const [performanceName, setPerformanceName] = useState("");
const [preview, setPreview] = useState<PreviewData | null>(null);
const [error, setError] = useState("");
```

| 状態 | 型 | 説明 |
|---|---|---|
| `performanceName` | `string` | 公演名テキスト入力の値 |
| `preview` | `PreviewData \| null` | パース結果（null = 未パース） |
| `error` | `string` | エラーメッセージ |

### テキスト入力と useState の連携

```tsx
<input
  type="text"
  value={performanceName}           // 表示する値
  onChange={(e) => setPerformanceName(e.target.value)}  // 変更されたら更新
/>
```

`value` と `onChange` をセットで書くことで、
入力内容が常に `performanceName` に反映される（**制御されたコンポーネント**）。

---

## 条件付きレンダリング

```tsx
{error && <p className="text-red-500">{error}</p>}

{preview && (
  <div>プレビュー表示...</div>
)}
```

- `{error && ...}` : `error` が空文字でない場合だけ表示
- `{preview && ...}` : `preview` が null でない場合だけ表示

JavaScriptでは空文字・null・undefinedは偽（falsy）として扱われる。

---

## 今回の処理の流れ

```
① フォームに公演名を入力・2つのCSVを選択
        ↓
② 「プレビューを確認する」ボタンを押す
        ↓
③ handlePreview が呼ばれる
        ↓
④ バリデーション（公演名・ファイルの確認）
        ↓
⑤ file.text() でCSVを読み込む
        ↓
⑥ parseCsv() でオブジェクト配列に変換
        ↓
⑦ setPreview() で状態を更新 → テーブルが表示される
```

---

## 完了の確認
- [ ] `http://localhost:3005/admin/upload` でフォームが表示される
- [ ] 公演名を未入力で送信するとエラーが出る
- [ ] CSVを選択せずに送信するとエラーが出る
- [ ] 正しいCSVを選択すると、パース結果がテーブルで表示される
