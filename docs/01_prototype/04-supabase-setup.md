# Step 4: Supabase プロジェクトの作成とテーブル設計

## 目標
- Supabase とは何かを理解する
- SQL の基本（CREATE TABLE, INSERT, SELECT）を理解する
- リレーション（外部キー）とは何かを理解する
- 全テーブルを作成し、テストデータを入れる

---

## Supabase とは

PostgreSQL データベース・管理UI・API をセットで提供するクラウドサービス。

```
Supabase が提供するもの:
├── データベース（PostgreSQL）  ← テーブルにデータを保存
├── テーブルエディタ            ← ブラウザでデータを確認・編集できるUI
├── SQL エディタ               ← SQL を直接実行できる
└── クライアントライブラリ      ← Next.js からデータを取得・保存するためのコード
```

無料プランで今回の規模（50〜100人・20ナンバー程度）は十分に動かせる。

---

## SQL の基本

SQL はデータベースを操作するための言語。

### テーブルを作る（CREATE TABLE）

```sql
create table members (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);
```

| キーワード | 意味 |
|---|---|
| `create table` | テーブルを新しく作る |
| `uuid` | 型: ランダムなID文字列（例: `a1b2c3d4-...`） |
| `text` | 型: 文字列 |
| `boolean` | 型: true / false |
| `date` | 型: 日付（例: `2026-04-10`） |
| `time` | 型: 時刻（例: `09:00:00`） |
| `primary key` | このカラムで行を一意に識別する |
| `default gen_random_uuid()` | 自動でランダムなIDを生成する |
| `not null` | 空欄を禁止する |

### データを入れる（INSERT）

```sql
insert into members (performance_id, name)
values ('（公演のID）', '田中花子');
```

### データを取り出す（SELECT）

```sql
-- members テーブルの全データを取得
select * from members;

-- 名前だけ取得
select name from members;

-- 条件を絞る
select * from members where performance_id = '（公演のID）';
```

---

## リレーション（外部キー）とは

テーブル同士を「ID で結びつける」仕組み。

```sql
create table members (
  id             uuid primary key default gen_random_uuid(),
  performance_id uuid not null references performances(id),  -- ← 外部キー
  name           text not null
);
```

`references performances(id)` は「`performances` テーブルの `id` と結びつける」という意味。

```
performances テーブル         members テーブル
┌─────────────────────┐      ┌──────────────────────────────────┐
│ id          │ name  │      │ id     │ performance_id │ name  │
│─────────────│───────│      │────────│────────────────│───────│
│ aaa-111     │ 春公演 │◀─────│ xxx-1  │ aaa-111        │ 田中  │
│ bbb-222     │ 夏公演 │      │ xxx-2  │ aaa-111        │ 鈴木  │
└─────────────────────┘      └──────────────────────────────────┘
```

外部キーのメリット:
- 存在しない `performance_id` を入れようとするとエラーになる
- テーブル間の整合性が保たれる

---

## テーブル構成（おさらい）

```
performances（公演）
  └── numbers（ナンバー）       performance_id → performances.id
  └── members（メンバー）       performance_id → performances.id
        └── number_members（出演者の紐付け）
        │     number_id → numbers.id
        │     member_id → members.id
        └── availabilities（空き日程）
              member_id → members.id
```

---

## 手順

### 1. Supabase アカウントを作成する

1. https://supabase.com を開く
2. 「Start your project」→ GitHub アカウントでサインアップ
3. 「New project」をクリック
4. 以下を設定して「Create new project」
   - Project name: `dance-schedule`
   - Database Password: 任意のパスワード（メモしておく）
   - Region: `Northeast Asia (Tokyo)`

プロジェクトの準備に1〜2分かかる。

### 2. テーブルを作成する

1. 左メニューの「SQL Editor」を開く
2. `supabase/schema.sql` の内容をコピーして貼り付ける
3. 「Run」ボタンをクリック
4. 左メニューの「Table Editor」を開き、5つのテーブルが作成されていることを確認

### 3. テストデータを入れる

Table Editor から直接データを入力できる。以下の順番で入れる
（外部キーの参照先から先に入れる必要がある）。

#### ① performances に公演を1件追加
| カラム | 値 |
|---|---|
| name | 春公演2026 |
| is_active | true |

#### ② members にメンバーを2〜3件追加
| カラム | 値 |
|---|---|
| performance_id | ①で作った公演の id をコピーして貼り付ける |
| name | 田中花子 |

#### ③ numbers にナンバーを1〜2件追加
| カラム | 値 |
|---|---|
| performance_id | ①と同じ id |
| name | ナンバーA |

#### ④ number_members で出演者を紐付ける
| カラム | 値 |
|---|---|
| number_id | ③で作ったナンバーの id |
| member_id | ②で作ったメンバーの id |
| is_choreographer | true（振り付け者の場合）|

---

## 完了の確認
- [ ] Supabase のプロジェクトが作成されている
- [ ] Table Editor に5つのテーブルが表示されている
- [ ] テストデータが入っている（performances・members・numbers・number_members）
