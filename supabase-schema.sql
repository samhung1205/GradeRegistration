-- 在 Supabase 專案裡：SQL Editor > New query > 貼上此段 > Run

-- 學生
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  name text not null,
  class_name text not null default '',
  created_at timestamptz default now()
);

-- 作業/測驗
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  test_id text not null,
  name text not null,
  type text not null default 'homework',
  date date,
  max_score int default 100,
  description text default '',
  created_at timestamptz default now()
);

-- 成績
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  score numeric,
  note text default '',
  ta text default '',
  created_at timestamptz default now(),
  unique(student_id, assignment_id)
);

-- 開放匿名讀寫（僅限此專案前端使用，anon key 可公開）
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.grades enable row level security;

-- 先刪除再建立，重複執行本 .sql 時才不會報錯 "policy already exists"
drop policy if exists "Allow all for anon" on public.students;
drop policy if exists "Allow all for anon" on public.assignments;
drop policy if exists "Allow all for anon" on public.grades;

create policy "Allow all for anon" on public.students for all using (true) with check (true);
create policy "Allow all for anon" on public.assignments for all using (true) with check (true);