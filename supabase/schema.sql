-- MEMORY PALACE — Supabase schema (optional, for post-MVP)

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists knowledge_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  summary text,
  raw_content text,
  created_at timestamptz default now()
);

create table if not exists concepts (
  id text not null,
  room_id uuid references knowledge_rooms(id) on delete cascade,
  title text not null,
  summary text,
  importance text,
  cluster text,
  source_excerpt text,
  position_x float,
  position_y float,
  position_z float,
  created_at timestamptz default now(),
  primary key (id, room_id)
);

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references knowledge_rooms(id) on delete cascade,
  source_concept_id text not null,
  target_concept_id text not null,
  label text,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references knowledge_rooms(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Adaptive AI memory (optional cloud sync)
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references knowledge_rooms(id) on delete cascade,
  concept_id text,
  kind text not null,
  title text,
  body text not null,
  embedding vector(1536),
  confidence float default 0.72,
  importance text,
  updated_at timestamptz default now()
);

create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references knowledge_rooms(id) on delete cascade,
  rating text not null,
  question text,
  answer text,
  correction_text text,
  chunk_id uuid references knowledge_chunks(id),
  created_at timestamptz default now()
);

create table if not exists study_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  room_id uuid references knowledge_rooms(id) on delete cascade,
  concept_id text not null,
  interaction_type text not null,
  created_at timestamptz default now()
);
