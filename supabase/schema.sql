-- Helis MVP-0 schema (run in Supabase SQL editor)

create type user_role as enum ('teacher', 'parent', 'admin');
create type event_type as enum ('attendance', 'academic', 'behavior', 'social', 'win', 'note');
create type event_valence as enum ('positive', 'neutral', 'concern');
create type digest_status as enum ('draft', 'approved', 'sent', 'failed');
create type preferred_language as enum ('en', 'hi');

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  grade int not null,
  section text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'teacher',
  full_name text not null,
  phone text,
  preferred_language preferred_language not null default 'en',
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,
  grade int not null,
  preferred_language preferred_language not null default 'en',
  created_at timestamptz not null default now()
);

create table guardian_links (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  unique (guardian_id, student_id)
);

create table student_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  created_by uuid not null references profiles(id),
  occurred_at timestamptz not null default now(),
  type event_type not null,
  valence event_valence not null,
  severity int not null check (severity between 1 and 3),
  tags text[] not null default '{}',
  body text not null,
  source_ref text
);

create table digests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  summary_en text not null,
  summary_hi text not null,
  highlights jsonb not null default '[]',
  suggested_home_actions jsonb not null default '[]',
  status digest_status not null default 'draft',
  delivery_channel text not null default 'whatsapp',
  sent_at timestamptz,
  delivery_log text,
  created_at timestamptz not null default now()
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references profiles(id) on delete cascade,
  channel text not null default 'whatsapp',
  consented_at timestamptz not null default now(),
  template_version_acknowledged text not null,
  unique (guardian_id, channel)
);

alter table schools enable row level security;
alter table classes enable row level security;
alter table profiles enable row level security;
alter table students enable row level security;
alter table guardian_links enable row level security;
alter table student_events enable row level security;
alter table digests enable row level security;
alter table consent_records enable row level security;

-- Phase 2: projects / Kanban / chat

create table projects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date timestamptz not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table project_groups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null
);

create table group_members (
  group_id uuid not null references project_groups(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  role text not null default 'member',
  primary key (group_id, student_id)
);

create table kanban_boards (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references project_groups(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade
);

create table kanban_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references kanban_boards(id) on delete cascade,
  name text not null,
  position int not null
);

create table kanban_cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references kanban_columns(id) on delete cascade,
  board_id uuid not null references kanban_boards(id) on delete cascade,
  title text not null,
  body text not null default '',
  assignee_id uuid references students(id),
  position int not null default 0,
  due_date timestamptz,
  moved_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  guardian_id uuid not null references profiles(id) on delete cascade,
  teacher_id uuid not null references profiles(id),
  updated_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender text not null,
  body text not null,
  ai_draft text,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table project_groups enable row level security;
alter table group_members enable row level security;
alter table kanban_boards enable row level security;
alter table kanban_columns enable row level security;
alter table kanban_cards enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
