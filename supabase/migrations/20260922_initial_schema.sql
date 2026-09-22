-- Schema já aplicado ao projeto Supabase vmitpfyqnlsrrrbvgjeo.
-- Mantido no repositório para controle de versão.

create table if not exists public.weeks (
  id text primary key,
  label text not null,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('em_criacao','para_aprovacao','aprovada','programada','publicada')),
  campaign text not null default '',
  general_instruction text not null default '',
  notes text not null default '',
  default_time time not null default '15:00',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  week_id text not null references public.weeks(id) on delete cascade,
  post_date date not null,
  weekday text not null,
  service text not null default '',
  title text not null default '',
  subtitle text not null default '',
  caption text not null default '',
  whatsapp_text text not null default '',
  hashtags text not null default '',
  image_url text,
  publish_time time not null default '15:00',
  channel text not null default 'ambos' check (channel in ('instagram','whatsapp','ambos')),
  notes text not null default '',
  status text not null default 'em_criacao' check (status in ('em_criacao','para_aprovacao','aprovada','programada','publicada')),
  ready boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('logo','arte_aprovada','foto','modelo','referencia')),
  storage_path text,
  public_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id smallint primary key default 1 check (id = 1),
  brand_name text not null default 'Immagine Comunicação Visual',
  whatsapp text not null default '(17) 99137-6531',
  instagram text not null default '@immaginecvrp',
  slogan text not null default 'Você imagina e a gente realiza.',
  default_time time not null default '15:00',
  timezone text not null default 'America/Sao_Paulo',
  instagram_enabled boolean not null default true,
  whatsapp_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_logs (
  id uuid primary key default gen_random_uuid(),
  week_id text not null references public.weeks(id) on delete cascade,
  action text not null check (action in ('approved','reopened','marked_ready','scheduled','published')),
  actor uuid default auth.uid(),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists posts_week_id_idx on public.posts(week_id);
create index if not exists approval_logs_week_id_idx on public.approval_logs(week_id);
