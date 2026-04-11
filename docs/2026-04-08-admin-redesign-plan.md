# 管理機能リニューアル 設計計画（2026-04-08）

## 変更の背景

- 複数公演を同時に管理したい
- CSV登録後にUIで編集できるようにしたい
- 公演の削除ができるようにしたい
- 将来的に複数サークルへの拡張に備えた構造にする

---

## 設計方針

現時点では自分のサークル1つだけで使うが、
将来複数サークルに拡張できるよう `circles` テーブルを最初から用意する。

```
circles（サークル）
  └── performances（公演）
        └── numbers（ナンバー）
        └── members（メンバー）
              └── number_members（出演者の紐付け）
              └── availabilities（空き日程）
```

サークルが1つだけの間は見た目は変わらないが、
将来サークルを追加するときにスキーマ変更なしで対応できる。

---

## スキーマ変更

### 追加: circles テーブル

```sql
create table circles (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);
```

### 変更: performances テーブル

- `is_active` を削除（複数公演を同時管理するため不要）
- `circle_id` を追加

```sql
create table performances (
  id        uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  name      text not null
);
```

### CASCADE削除の整理

```
circles を削除
  → performances を削除（cascade）
    → numbers を削除（cascade）
    → members を削除（cascade）
      → number_members を削除（cascade）
      → availabilities を削除（cascade）
```

各テーブルの外部キーに `on delete cascade` を追加する。

### 初期データ

サークルが1つの間は、Supabase のダッシュボードから手動で1件 `circles` に追加する。

```sql
insert into circles (name) values ('（サークル名）');
```

---

## URLの構造

サークルIDを URL に含めることで、将来複数サークルに対応できる。

```
/c/[circleId]/                                        ホーム（公演一覧）
/c/[circleId]/submit/[performanceId]                  日程提出
/c/[circleId]/numbers/[performanceId]                 ナンバー一覧
/c/[circleId]/numbers/[performanceId]/[numberId]      候補日
/c/[circleId]/admin                                   管理トップ
/c/[circleId]/admin/upload                            CSV で新規公演を作成
/c/[circleId]/admin/[performanceId]                   公演編集
```

### `/` の扱い

サークルが1つの間は `/` にアクセスしたら自動的に `/c/[circleId]/` にリダイレクトする。
将来サークルが複数になった場合はサークル選択ページにする。

---

## 各ページの仕様

### `/c/[circleId]/`  ホーム

- そのサークルの全公演の一覧を表示する
- 各公演カードに「日程を提出する」「候補日を確認する」ボタン
- 「管理ページへ」リンク（注意書きつき）

```
春公演2026
[ 日程を提出する ]  [ 候補日を確認する ]

夏公演2026
[ 日程を提出する ]  [ 候補日を確認する ]

---
⚠️ 管理ページ（スケジュール係以外は編集しないでください）
[ 管理ページへ ]
```

### `/c/[circleId]/admin`  管理トップ

- 注意書き
- 全公演の一覧（各公演の「編集」「削除」ボタンつき）
- 「新しい公演をCSVで登録」ボタン

### `/c/[circleId]/admin/upload`  CSV登録

- 現状の `/admin/upload` とほぼ同じ
- `is_active` への操作を削除
- `circle_id` を使って公演を登録するよう変更

### `/c/[circleId]/admin/[performanceId]`  公演編集

以下の操作ができる：

**公演**
- 公演名の変更

**メンバー**
- メンバーの追加（名前入力）
- メンバー名の変更
- メンバーの削除

**ナンバー**
- ナンバーの追加（名前入力）
- ナンバー名の変更
- ナンバーの削除
- 出演者の追加・削除
- 振付者フラグの変更

---

## 新規APIルート

| メソッド | パス | 処理 |
|---|---|---|
| `DELETE` | `/api/performances/[id]` | 公演の削除 |
| `PATCH` | `/api/performances/[id]` | 公演名の変更 |
| `POST` | `/api/members` | メンバーの追加 |
| `PATCH` | `/api/members/[id]` | メンバー名の変更 |
| `DELETE` | `/api/members/[id]` | メンバーの削除 |
| `POST` | `/api/numbers` | ナンバーの追加 |
| `PATCH` | `/api/numbers/[id]` | ナンバー名の変更 |
| `DELETE` | `/api/numbers/[id]` | ナンバーの削除 |
| `POST` | `/api/number-members` | 出演者の追加 |
| `DELETE` | `/api/number-members/[numberId]/[memberId]` | 出演者の削除 |
| `PATCH` | `/api/number-members/[numberId]/[memberId]` | 振付者フラグの変更 |

---

## 変更が必要なファイル

| ファイル | 変更内容 |
|---|---|
| `supabase/schema.sql` | circles 追加・is_active 削除・circle_id 追加・CASCADE追加 |
| `app/page.tsx` | `/c/[circleId]/` へのリダイレクト |
| `app/submit/page.tsx` | `app/c/[circleId]/submit/[performanceId]/page.tsx` に移動 |
| `app/numbers/page.tsx` | `app/c/[circleId]/numbers/[performanceId]/page.tsx` に移動 |
| `app/numbers/[id]/page.tsx` | `app/c/[circleId]/numbers/[performanceId]/[numberId]/page.tsx` に移動 |
| `app/api/upload/route.ts` | is_active 処理を削除・circle_id を使うよう変更 |
| `components/NameSelector.tsx` | performanceId を props で受け取るよう変更 |
| 新規 | `app/c/[circleId]/page.tsx` ホーム |
| 新規 | `app/c/[circleId]/admin/page.tsx` 管理トップ |
| 新規 | `app/c/[circleId]/admin/upload/page.tsx` CSV登録 |
| 新規 | `app/c/[circleId]/admin/[performanceId]/page.tsx` 公演編集 |
| 新規 | 各APIルート |

---

## Supabase で実行するSQL

```sql
-- circles テーブルを追加
create table circles (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);

-- performances に circle_id を追加・is_active を削除
alter table performances add column circle_id uuid references circles(id) on delete cascade;
alter table performances drop column is_active;

-- CASCADE削除を追加
alter table members drop constraint members_performance_id_fkey;
alter table members add constraint members_performance_id_fkey
  foreign key (performance_id) references performances(id) on delete cascade;

alter table numbers drop constraint numbers_performance_id_fkey;
alter table numbers add constraint numbers_performance_id_fkey
  foreign key (performance_id) references performances(id) on delete cascade;

alter table number_members drop constraint number_members_number_id_fkey;
alter table number_members add constraint number_members_number_id_fkey
  foreign key (number_id) references numbers(id) on delete cascade;

alter table number_members drop constraint number_members_member_id_fkey;
alter table number_members add constraint number_members_member_id_fkey
  foreign key (member_id) references members(id) on delete cascade;

alter table availabilities drop constraint availabilities_member_id_fkey;
alter table availabilities add constraint availabilities_member_id_fkey
  foreign key (member_id) references members(id) on delete cascade;

-- サークルを1件追加（サークル名は適宜変更）
insert into circles (name) values ('自分のサークル名');
```

---

## 実装手順

1. Supabase でスキーマ変更（circles 追加・is_active 削除・circle_id 追加・CASCADE追加）
2. Supabase で circles に1件データを追加
3. `supabase/schema.sql` を更新
4. `app/page.tsx` をリダイレクトに変更
5. 既存ページを新しいルートに移動・`performanceId` 対応

   **作成するファイル**

   | 移動元 | 移動先 |
   |---|---|
   | `app/submit/page.tsx` | `app/c/[circleId]/submit/[performanceId]/page.tsx` |
   | `app/numbers/page.tsx` | `app/c/[circleId]/numbers/[performanceId]/page.tsx` |
   | `app/numbers/[id]/page.tsx` | `app/c/[circleId]/numbers/[performanceId]/[numberId]/page.tsx` |

   **各ページの変更内容**

   - `is_active` による絞り込みをやめ、URLの `performanceId` を使ってデータを取得する
   - ページ内のリンク（戻るリンク・ナンバーへのリンク）を新しいURL構造に合わせて更新する

   **`submit/[performanceId]/page.tsx` の変更点**

   ```tsx
   // 変更前: is_active で公演を取得してから members を取得
   const { data: performance } = await supabase.from("performances").select("id").eq("is_active", true).single();
   const { data: members } = await supabase.from("members").select("id, name").eq("performance_id", performance.id);

   // 変更後: params の performanceId で直接 members を取得
   const { performanceId } = await params;
   const { data: members } = await supabase.from("members").select("id, name").eq("performance_id", performanceId);
   ```

   **`numbers/[performanceId]/page.tsx` の変更点**

   ```tsx
   // 変更前: is_active で公演を取得してから numbers を取得
   const { data: performance } = await supabase.from("performances").select("id, name").eq("is_active", true).single();
   const { data: numbers } = await supabase.from("numbers").select(...).eq("performance_id", performance.id);

   // 変更後: params の performanceId で直接 numbers を取得
   const { circleId, performanceId } = await params;
   const { data: numbers } = await supabase.from("numbers").select(...).eq("performance_id", performanceId);
   // 戻るリンク: /c/[circleId]/
   // ナンバーへのリンク: /c/[circleId]/numbers/[performanceId]/[numberId]
   ```

   **`numbers/[performanceId]/[numberId]/page.tsx` の変更点**

   ```tsx
   // 変更前: params.id でナンバーを取得
   const { id } = await params;

   // 変更後: params.numberId でナンバーを取得
   const { circleId, performanceId, numberId } = await params;
   // 戻るリンク: /c/[circleId]/numbers/[performanceId]
   ```

   **`NameSelector.tsx` は変更不要**

   `submit/page.tsx` が members を取得して props で渡す構造はそのまま。
   `NameSelector` 自身は `performanceId` を使わない。
6. `app/api/upload/route.ts` を更新

   **変更内容**

   - `is_active` に関する処理をすべて削除する（既存公演を非アクティブ化・新規公演を `is_active: true` で作成）
   - 新規公演を作成するとき `circle_id` を指定するよう変更する

   `circle_id` はリクエストボディで受け取る。呼び出し元の `admin/upload` ページが URL から `circleId` を持っているため、そこから渡す。

   **変更前後の差分（公演作成部分）**

   ```ts
   // 変更前
   // 1. 既存の公演を非アクティブにする
   await supabase.from("performances").update({ is_active: false }).eq("is_active", true);

   // 2. 新しい公演を作成する
   const { data: performance } = await supabase
     .from("performances")
     .insert({ name: performanceName, is_active: true })
     .select("id")
     .single();

   // 変更後
   // 1. 新しい公演を作成する（is_active 廃止・circle_id を指定）
   const { data: performance } = await supabase
     .from("performances")
     .insert({ name: performanceName, circle_id: circleId })
     .select("id")
     .single();
   ```

   **リクエストボディの変更**

   ```ts
   // 変更前
   { performanceName, memberNames, numberMembers }

   // 変更後
   { circleId, performanceName, memberNames, numberMembers }
   ```
7. 各 API ルートを作成

   **作成するファイル**

   | ファイル | メソッド | 処理 |
   |---|---|---|
   | `app/api/performances/[id]/route.ts` | `PATCH` | 公演名の変更 |
   | `app/api/performances/[id]/route.ts` | `DELETE` | 公演の削除 |
   | `app/api/members/route.ts` | `POST` | メンバーの追加 |
   | `app/api/members/[id]/route.ts` | `PATCH` | メンバー名の変更 |
   | `app/api/members/[id]/route.ts` | `DELETE` | メンバーの削除 |
   | `app/api/numbers/route.ts` | `POST` | ナンバーの追加 |
   | `app/api/numbers/[id]/route.ts` | `PATCH` | ナンバー名の変更 |
   | `app/api/numbers/[id]/route.ts` | `DELETE` | ナンバーの削除 |
   | `app/api/number-members/route.ts` | `POST` | 出演者の追加 |
   | `app/api/number-members/[numberId]/[memberId]/route.ts` | `DELETE` | 出演者の削除 |
   | `app/api/number-members/[numberId]/[memberId]/route.ts` | `PATCH` | 振付者フラグの変更 |

   **各APIのリクエスト・処理内容**

   ```
   PATCH /api/performances/[id]
     body: { name: string }
     処理: performances テーブルの name を更新

   DELETE /api/performances/[id]
     処理: performances テーブルから削除（CASCADE で members/numbers も削除）

   POST /api/members
     body: { performanceId: string, name: string }
     処理: members テーブルに追加

   PATCH /api/members/[id]
     body: { name: string }
     処理: members テーブルの name を更新

   DELETE /api/members/[id]
     処理: members テーブルから削除

   POST /api/numbers
     body: { performanceId: string, name: string }
     処理: numbers テーブルに追加

   PATCH /api/numbers/[id]
     body: { name: string }
     処理: numbers テーブルの name を更新

   DELETE /api/numbers/[id]
     処理: numbers テーブルから削除

   POST /api/number-members
     body: { numberId: string, memberId: string }
     処理: number_members テーブルに追加（is_choreographer: false）

   DELETE /api/number-members/[numberId]/[memberId]
     処理: number_members テーブルから削除

   PATCH /api/number-members/[numberId]/[memberId]
     body: { isChoreographer: boolean }
     処理: number_members テーブルの is_choreographer を更新
   ```

   **共通仕様**

   - 成功時: `{ ok: true }` を返す
   - 失敗時: `{ ok: false, error: string }` をステータス500で返す
8. `/c/[circleId]/` ホームを作成

   **作成するファイル**: `app/c/[circleId]/page.tsx`

   **データ取得**

   - `params` から `circleId` を取得
   - `performances` テーブルから `circle_id = circleId` の公演一覧を取得

   **表示内容**

   - 公演カードの一覧（公演ごとに「日程を提出する」「候補日を確認する」ボタン）
   - 管理ページへのリンク（注意書きつき）

   **リンク先**

   | ボタン | リンク先 |
   |---|---|
   | 日程を提出する | `/c/[circleId]/submit/[performanceId]` |
   | 候補日を確認する | `/c/[circleId]/numbers/[performanceId]` |
   | 管理ページへ | `/c/[circleId]/admin` |

   **表示イメージ**

   ```
   春公演2026
   [ 日程を提出する ]  [ 候補日を確認する ]

   夏公演2026
   [ 日程を提出する ]  [ 候補日を確認する ]

   ---
   ⚠️ 管理ページ（スケジュール係以外は編集しないでください）
   [ 管理ページへ ]
   ```
9. `/c/[circleId]/admin` 管理トップを作成

   **作成するファイル**: `app/c/[circleId]/admin/page.tsx`

   **データ取得**

   - `params` から `circleId` を取得
   - `performances` テーブルから `circle_id = circleId` の公演一覧を取得

   **表示内容**

   - 注意書き（スケジュール係以外は編集しないよう促す文言）
   - 公演一覧（各公演に「編集」「削除」ボタン）
   - 「新しい公演をCSVで登録」ボタン

   **リンク先**

   | ボタン | リンク先 |
   |---|---|
   | 編集 | `/c/[circleId]/admin/[performanceId]`（手順10で作成） |
   | 削除 | `DELETE /api/performances/[id]`（手順7で作成） |
   | CSVで登録 | `/c/[circleId]/admin/upload` |
   | ホームに戻る | `/c/[circleId]/` |

   **注意点**

   削除ボタンはクライアントサイドの操作（APIを叩く）が必要なため、削除ボタン部分だけクライアントコンポーネントに切り出す。ページ本体はサーバーコンポーネントのまま保つ。

   手順7（`DELETE /api/performances/[id]`）がまだ未実装なので、この時点では削除ボタンはUI上に置くだけでよい。
10. `/c/[circleId]/admin/[performanceId]` 公演編集を作成

   **作成するファイル**

   - `app/c/[circleId]/admin/[performanceId]/page.tsx`（サーバーコンポーネント）
   - `components/PerformanceEditor.tsx`（クライアントコンポーネント）

   ページ本体はデータ取得のみ行い、編集UIはすべて `PerformanceEditor` に渡す。

   **データ取得（page.tsx）**

   - `performanceId` で公演名・メンバー一覧・ナンバー一覧（出演者つき）を取得
   - `PerformanceEditor` に props として渡す

   **PerformanceEditor の構成**

   3つのセクションに分ける：

   **① 公演名の変更**
   - テキスト入力 + 保存ボタン
   - `PATCH /api/performances/[id]`

   **② メンバー管理**
   - メンバー一覧（各メンバーに名前変更・削除ボタン）
   - 名前変更: インライン入力 + 保存ボタン → `PATCH /api/members/[id]`
   - 削除: `DELETE /api/members/[id]`
   - 新規追加: 名前入力 + 追加ボタン → `POST /api/members`

   **③ ナンバー管理**
   - ナンバー一覧（各ナンバーに名前変更・削除ボタン、出演者一覧）
   - 名前変更: インライン入力 + 保存ボタン → `PATCH /api/numbers/[id]`
   - 削除: `DELETE /api/numbers/[id]`
   - 新規追加: 名前入力 + 追加ボタン → `POST /api/numbers`
   - 出演者の追加: メンバー選択ドロップダウン + 追加ボタン → `POST /api/number-members`
   - 出演者の削除: `DELETE /api/number-members/[numberId]/[memberId]`
   - 振付者フラグ: チェックボックス → `PATCH /api/number-members/[numberId]/[memberId]`

   **APIが未実装の間の扱い**

   手順7（APIルート群）が未実装なので、各操作は404になる。
   手順10と手順7は並行して進める（UIを先に作り、APIを後から実装してもよい）。

   **操作後の画面更新**

   `router.refresh()` を呼び出してサーバーから最新データを再取得する。
