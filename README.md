# dance-schedule

ダンスサークル向けのスケジュール調整 Web アプリ。

---

## 機能

- **日程提出**: メンバーが空き時間を 30 分単位で提出する
- **候補日確認**: ナンバーごとに練習候補日を欠席数の少ない順で表示する
- **CSV アップロード**: 管理者が Google スプレッドシートから出力した CSV を登録する

## 使い方

### メンバー向け
1. トップページで「日程を提出する」をタップ
2. 名前を選んでカレンダーから日付を選択
3. 空いている時間帯をタップして「提出する」

### スケジュール係向け
1. トップページで「候補日を確認する」をタップ
2. ナンバーを選ぶと練習候補日が欠席数の少ない順に表示される

### 管理者向け
1. `/admin/upload` にアクセス
2. Google スプレッドシートから出力した CSV（メンバー・ナンバー）をアップロード

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL)
- **デプロイ**: Vercel

## ローカル開発

```bash
npm install
npm run dev   # http://localhost:3005
```

`.env.local` に以下を設定する：

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
