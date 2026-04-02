# Step 15: Vercel にデプロイして URL を発行する

## 目標
- GitHub にコードをプッシュする
- Vercel と連携して自動デプロイを設定する
- 環境変数を Vercel に設定する
- 本番 URL でスマホから動作確認する

---

## 全体の流れ

```
① GitHub にプッシュ
        ↓
② Vercel でプロジェクトをインポート
        ↓
③ 環境変数を Vercel に設定
        ↓
④ デプロイ実行・URL 確認
        ↓
⑤ スマホで動作確認
```

---

## ① GitHub にプッシュ

現在のコードを GitHub に送る。

```bash
git push origin main
```

ターミナルで上記を実行する。
リポジトリは `https://github.com/smkzh/dance-schedule` に公開済み。

---

## ② Vercel でプロジェクトをインポート

1. [vercel.com](https://vercel.com) にアクセスしてログイン（GitHub アカウントで OK）
2. ダッシュボードで **「Add New Project」** をクリック
3. `dance-schedule` リポジトリを選択して **「Import」**
4. 設定画面が開く

### ルートディレクトリの設定（重要）

このプロジェクトはリポジトリのルートではなく `web/` フォルダが Next.js のプロジェクト本体。

設定画面の **「Root Directory」** に `web` と入力する。

```
dance-schedule/        ← リポジトリのルート
├── docs/
└── web/               ← ここを Root Directory に指定
    ├── app/
    ├── components/
    └── package.json
```

Framework Preset は自動で **Next.js** が選ばれるはず。

---

## ③ 環境変数を Vercel に設定

デプロイ設定画面の **「Environment Variables」** に以下を追加する。

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon key |

### Supabase の値の確認方法

1. [supabase.com](https://supabase.com) にログイン
2. プロジェクトを開く
3. 左メニュー「Project Settings」→「API」
4. **Project URL** と **anon public** をコピー

ローカルの `web/.env.local` に書いてある値と同じものを使う。

---

## ④ デプロイ実行

「Deploy」ボタンを押すとビルドが始まる（1〜2 分程度）。

完了すると `https://（プロジェクト名）.vercel.app` のような URL が発行される。

### 以降は自動デプロイ

`git push origin main` するたびに Vercel が自動でビルド・デプロイする。
コードを更新したら push するだけで本番に反映される。

---

## ⑤ 動作確認

以下をスマホのブラウザで確認する。

- [ ] ホームページに公演名が表示される
- [ ] 「日程を提出する」→名前を選んで日程を登録できる
- [ ] 「候補日を確認する」→ナンバー一覧・候補日が表示される
- [ ] `/admin/upload` で CSV をアップロードできる

---

## Vercel と GitHub の関係

```
ローカルで開発
    ↓ git push
GitHub（コードの保管場所）
    ↓ 自動検知
Vercel（ビルド・公開）
    ↓
https://xxx.vercel.app（本番 URL）
```

**push = デプロイ** という流れになる。
`main` ブランチへの push が本番に反映される。

---

## 完了の確認
- [ ] `git push` でエラーが出ない
- [ ] Vercel のダッシュボードでビルドが成功している
- [ ] 本番 URL にアクセスできる
- [ ] スマホから日程提出・候補日確認ができる
