# Step 6-2: admin/upload/page.tsx の全体の流れ

---

## TSXファイルの一般的な構成順

```tsx
// 1. import
//    外部のライブラリや他ファイルの関数・型を読み込む
import { useState } from "react";
import Link from "next/link";

// 2. 型定義
//    このファイル内で使うデータの形を定義する
type PreviewData = { ... };

// 3. ヘルパー関数
//    コンポーネントの外に置く「純粋な変換・計算処理」
//    （状態や画面に依存しない処理）
function parseCsv(text: string) { ... }

// 4. コンポーネント本体（export default function）
export default function AdminUploadPage() {

  // 4-1. 状態（useState）
  //      画面の表示に影響する値を定義する
  const [preview, setPreview] = useState(null);

  // 4-2. イベントハンドラ
  //      ユーザー操作に反応する関数。状態を更新することが多い
  async function handlePreview(e) { ... }

  // 4-3. return（JSX）
  //      実際に表示する画面を返す
  return (
    <main>...</main>
  );
}
```

この順番には明確な理由がある：
- **import は先頭** : 他のコードが実行される前に依存関係を解決する必要がある
- **ヘルパーはコンポーネントの外** : 状態に依存しないので外に出した方がシンプル。再利用もしやすい
- **状態はハンドラより先** : ハンドラの中で状態の `set〇〇` を使うため、先に定義が必要
- **return は最後** : 上で定義した状態・関数をすべて使った上で画面を組み立てる

---

## 登場する関数・状態の一覧

```
【状態】
  performanceName   公演名テキストの現在の値
  preview           パース済みデータ（null = まだパースしていない）
  error             エラーメッセージ（"" = エラーなし）

【関数】
  parseCsv()        CSVテキスト → オブジェクト配列に変換する
  handlePreview()   フォーム送信時に呼ばれる。parseCsv を呼び出す
```

---

## イベントハンドラとは

ユーザーの操作（クリック・入力・送信など）をきっかけに呼ばれる関数のこと。
JSXの属性として `on〇〇={}` の形で登録する。

```tsx
// フォームが送信されたとき → handlePreview を呼ぶ
<form onSubmit={handlePreview}>

// テキストが変更されたとき → setPerformanceName を呼ぶ
<input onChange={(e) => setPerformanceName(e.target.value)} />
```

このファイルで使われているイベントハンドラ：

| 属性 | いつ発火するか | 何を呼ぶか |
|---|---|---|
| `onSubmit={handlePreview}` | submitボタンが押されたとき | `handlePreview` |
| `onChange={...}` | テキスト入力が変更されたとき | `setPerformanceName` |

どちらも「ユーザーが操作した」→「関数が呼ばれる」→「状態が更新される」→「画面が再描画される」という同じ流れになっている。

---

## 呼び出しの流れ

```
ユーザーがボタンを押す
  ↓
form の onSubmit が発火
  ↓
handlePreview(e) が呼ばれる
  ├─ バリデーション（公演名・ファイルの確認）
  │    問題あり → setError() でエラー状態を更新して終了
  │
  ├─ file.text() でCSVファイルを文字列として読み込む
  │
  ├─ parseCsv(membersText) を呼ぶ
  │    └─ CSVテキスト → [{ member_name: "田中花子" }, ...] を返す
  │
  ├─ parseCsv(numbersText) を呼ぶ
  │    └─ CSVテキスト → [{ number_name: "ナンバーA", ... }, ...] を返す
  │
  └─ setPreview({ members, numberMembers }) で状態を更新
            ↓
       preview が null → データあり に変わる
            ↓
       画面が再描画され、プレビューテーブルが表示される
```

---

## 状態と画面表示の対応

状態が変わるたびに画面が再描画される。

```
【初期状態】
  error = ""       → エラーメッセージは非表示
  preview = null   → プレビューテーブルは非表示

【バリデーションエラー後】
  error = "公演名を入力してください"  → エラーメッセージが表示される

【パース成功後】
  preview = { members: [...], numberMembers: [...] }
                   → プレビューテーブルが表示される
```

---

## ショートサーキット評価

このファイルの `return` 内で、条件によって表示・非表示を切り替えるのに使われている。

```tsx
{error && <p>{error}</p>}
{preview && <div>プレビュー...</div>}
```

`A && B` は「A が truthy なら B を評価して返す、falsy なら A の時点で止まる（B を評価しない）」という動作。

```
error = ""（空文字 = falsy）  → 止まる → 何も表示されない
error = "公演名を..."（= truthy） → <p> が表示される

preview = null（= falsy）    → 止まる → テーブルは表示されない
preview = { ... }（= truthy）→ テーブルが表示される
```

`if` 文を書かずに「条件を満たしたときだけ表示する」を1行で表現できる。

---

## parseCsv の役割

`handlePreview` から2回呼ばれる（メンバー用・ナンバー用）。

```
入力: "member_name\n田中花子\n鈴木太郎"（CSVの文字列）

出力: [
        { member_name: "田中花子" },
        { member_name: "鈴木太郎" },
      ]
```

変換後のオブジェクト配列は、画面で `.map()` を使ってテーブルの行に変換される。
