-- ダンススケジュールアプリ テーブル定義
-- Supabase の SQL Editor に貼り付けて実行する

-- 公演
create table performances (
  id         uuid primary key default gen_random_uuid(),
  name       text    not null,
  is_active  boolean not null default false
);

-- メンバー
create table members (
  id             uuid primary key default gen_random_uuid(),
  performance_id uuid not null references performances(id),
  name           text not null
);

-- ナンバー
create table numbers (
  id             uuid primary key default gen_random_uuid(),
  performance_id uuid not null references performances(id),
  name           text not null
);

-- 出演者の紐付け（ナンバー × メンバー）
create table number_members (
  number_id        uuid    not null references numbers(id),
  member_id        uuid    not null references members(id),
  is_choreographer boolean not null default false,
  primary key (number_id, member_id)
);

-- 空き日程（1行 = 30分スロット1つ）
create table availabilities (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid not null references members(id),
  available_date date not null,
  time_slot      time not null
);
