# Step 7: CSVデータをSupabaseに保存する

## 目標
- API ルート（`route.ts`）の作り方を理解する
- フロントエンドから API にデータを送る方法（fetch）を理解する
- 複数テーブルへの順番を意識した保存処理を理解する

---

## 作成・更新したファイル

```
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts       ← 新規: 保存処理のAPIルート
│   └── admin/upload/
│       └── page.tsx           ← 更新: 保存ボタンと handleSave を追加
```

---

## API ルートとは

`app/api/` 以下に `route.ts` を置くと API エンドポイントになる。

```
app/api/upload/route.ts  →  POST /api/upload
```

ページ（`page.tsx`）と違い、画面を返すのではなく**データを受け取って処理を返す**。

```ts
// route.ts の基本形
export async function POST(request: Request) {
  const body = await request.json(); // リクエストのデータを受け取る
  // 処理...
  return NextResponse.json({ ok: true }); // レスポンスを返す
}
```

**なぜ API ルートが必要か？**
Supabase への書き込み処理は Client Component（ブラウザ）から直接でも可能だが、
API ルート（サーバー側）を経由することで処理をひとまとめにできる。
複数テーブルへの連続した書き込みのような複雑な処理はサーバー側に置くのが適切。

---

## 保存の順番（外部キー制約）

テーブルに外部キーがある場合、**参照される側を先に作る**必要がある。

```
① performances を作る（id が発行される）
        ↓
② members を作る（performance_id に①の id を使う）
③ numbers を作る（performance_id に①の id を使う）
        ↓
④ number_members を作る（number_id・member_id に②③の id を使う）
```

逆の順番にすると「参照先が存在しない」というエラーになる。

---

## id のマップを作る理由

`number_members` を登録するには `number_id` と `member_id`（uuid）が必要。
しかし CSV に書いてあるのは名前だけなので、「名前 → id」に変換する必要がある。

```ts
// ③ members を insert 後、戻り値から名前→idのマップを作る
const memberMap: Record<string, string> = Object.fromEntries(
  insertedMembers.map((m) => [m.name, m.id])
);
// → { "田中花子": "uuid-xxx", "鈴木太郎": "uuid-yyy" }

// ④ number_members を insert するときにマップで id を引く
member_id: memberMap[r.member_name]  // "田中花子" → "uuid-xxx"
```

---

## is_choreographer の判定

振り付け者かどうかは CSV の `choreographer` カラムと `member_name` を比較して判定する。

```ts
is_choreographer: r.choreographer === r.member_name
// 例: choreographer="田中花子", member_name="田中花子" → true
// 例: choreographer="田中花子", member_name="鈴木太郎" → false
```

---

## フロントエンドから API を呼ぶ（fetch）

```ts
// admin/upload/page.tsx の handleSave
const res = await fetch("/api/upload", {
  method: "POST",                               // POST リクエスト
  headers: { "Content-Type": "application/json" }, // JSON を送ることを伝える
  body: JSON.stringify({                        // オブジェクトをJSON文字列に変換
    performanceName,
    memberNames: preview.members.map((r) => r.member_name),
    numberMembers: preview.numberMembers,
  }),
});

setSaveResult(res.ok ? "success" : "error");   // 結果を状態に反映
```

`res.ok` は HTTP ステータスが 200〜299 のとき `true`。

### memberNames だけ .map() で変換している理由

`preview.members` は `parseCsv` の出力なのでオブジェクトの配列になっている。

```ts
// preview.members の中身
[{ member_name: "田中花子" }, { member_name: "鈴木太郎" }]
```

API 側でメンバー名として必要なのは文字列だけなので、`.map()` で値だけ取り出している。

```ts
preview.members.map((r) => r.member_name)
// → ["田中花子", "鈴木太郎"]
```

一方 `numberMembers` は `number_name` / `choreographer` / `member_name` の3つの値をすべて API 側で使うため、そのままオブジェクトの配列で渡している。

---

## 呼び出しの全体像

```
【フロントエンド: page.tsx】
  「Supabaseに保存する」ボタンを押す
    ↓
  handleSave() が呼ばれる
    ↓
  fetch("/api/upload", { body: { performanceName, memberNames, numberMembers } })
    ↓
【サーバー: route.ts】
  POST /api/upload が受信する
    ↓
  ① performances を非アクティブ化
  ② performances に新規INSERT → id 取得
  ③ members に INSERT → 名前→idマップ作成
  ④ numbers に INSERT（重複除去）→ 名前→idマップ作成
  ⑤ number_members に INSERT
    ↓
  { ok: true } を返す
    ↓
【フロントエンド: page.tsx】
  res.ok = true → saveResult = "success" →「保存しました」を表示
```

---

## 完了の確認
- [ ] `/admin/upload` でプレビューを確認後、「Supabaseに保存する」ボタンが表示される
- [ ] ボタンを押すと「保存中...」になり、完了後「保存しました」と表示される
- [ ] Supabase の Table Editor で各テーブルにデータが入っている
- [ ] ホームページ（`/`）に公演名が表示される
