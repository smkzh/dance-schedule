-- ダンススケジュールアプリ テーブル定義
-- Supabase の SQL Editor に貼り付けて実行する

-- サークル
create table circles (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);

-- 公演
create table performances (
  id        uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  name      text not null
);

-- メンバー
create table members (
  id             uuid primary key default gen_random_uuid(),
  performance_id uuid not null references performances(id) on delete cascade,
  name           text not null
);

-- ナンバー
create table numbers (
  id             uuid primary key default gen_random_uuid(),
  performance_id uuid not null references performances(id) on delete cascade,
  name           text not null
);

-- 出演者の紐付け（ナンバー × メンバー）
create table number_members (
  number_id        uuid    not null references numbers(id) on delete cascade,
  member_id        uuid    not null references members(id) on delete cascade,
  is_choreographer boolean not null default false,
  primary key (number_id, member_id)
);

-- 空き日程（1行 = 30分スロット1つ）
create table availabilities (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid not null references members(id) on delete cascade,
  available_date date not null,
  time_slot      time not null
);
