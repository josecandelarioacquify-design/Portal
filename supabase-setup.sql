-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'client' check (role in ('admin', 'client')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- PROJECTS
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  client_name text,
  client_email text,
  status text default 'planning' check (status in ('planning','in_progress','review','completed','on_hold')),
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  start_date date,
  due_date date,
  budget numeric,
  spent numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Admins see all projects" on public.projects for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Clients see own projects" on public.projects for select using (
  client_email = (select email from auth.users where id = auth.uid())
);

-- DOCUMENTS
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text default 'other' check (category in ('contract','proposal','report','invoice','deliverable','brief','other')),
  status text default 'draft' check (status in ('draft','pending_review','approved','signed','archived')),
  client_name text,
  client_email text,
  project_name text,
  file_url text,
  version text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.documents enable row level security;
create policy "Admins see all documents" on public.documents for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Clients see own documents" on public.documents for select using (
  client_email = (select email from auth.users where id = auth.uid())
);

-- CALENDAR EVENTS
create table public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date date not null,
  time text,
  event_type text default 'other' check (event_type in ('milestone','meeting','deadline','review','delivery','other')),
  status text default 'pending',
  client_name text,
  client_email text,
  project_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.calendar_events enable row level security;
create policy "Admins see all events" on public.calendar_events for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Clients see own events" on public.calendar_events for select using (
  client_email = (select email from auth.users where id = auth.uid())
);
