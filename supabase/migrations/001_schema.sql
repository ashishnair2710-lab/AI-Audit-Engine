-- ============================================================
-- Al Huzaifa Furniture — CRM Portal Schema
-- ============================================================

-- ── clients ──────────────────────────────────────────────────
create table if not exists clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  logo_url   text,
  created_at timestamptz not null default now()
);

-- ── profiles (links auth.users to a client) ──────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  client_id  uuid not null references clients(id),
  full_name  text,
  role       text default 'viewer',
  created_at timestamptz not null default now()
);

-- ── leads ────────────────────────────────────────────────────
create table if not exists leads (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients(id),
  name             text not null,
  phone            text,
  email            text,
  source           text check (source in ('meta_ad','google','website','tiktok')),
  status           text check (status in ('new','contacted','qualified','cold')) default 'new',
  whatsapp_status  text check (whatsapp_status in ('sent','replied','no_reply','handed_off')) default 'sent',
  call_status      text check (call_status in ('queued','answered','not_answered','callback')) default 'queued',
  ai_summary       text,
  transcript       text,
  interest         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on leads
  for each row execute procedure set_updated_at();

-- ── whatsapp_events ──────────────────────────────────────────
create table if not exists whatsapp_events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  client_id   uuid not null references clients(id),
  event_type  text check (event_type in ('message_sent','message_received','bot_replied','agent_assigned','conversation_closed')),
  created_at  timestamptz not null default now()
);

-- ── call_events ──────────────────────────────────────────────
create table if not exists call_events (
  id               uuid primary key default gen_random_uuid(),
  lead_id          uuid not null references leads(id) on delete cascade,
  client_id        uuid not null references clients(id),
  event_type       text check (event_type in ('call_started','call_ended','call_analyzed')),
  duration_seconds integer default 0,
  outcome          text check (outcome in ('answered','not_answered','callback','qualified')),
  created_at       timestamptz not null default now()
);

-- ── indexes ──────────────────────────────────────────────────
create index if not exists leads_client_id_idx         on leads(client_id);
create index if not exists leads_status_idx            on leads(status);
create index if not exists leads_source_idx            on leads(source);
create index if not exists leads_created_at_idx        on leads(created_at desc);
create index if not exists whatsapp_events_lead_id_idx on whatsapp_events(lead_id);
create index if not exists call_events_lead_id_idx     on call_events(lead_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table clients          enable row level security;
alter table profiles         enable row level security;
alter table leads            enable row level security;
alter table whatsapp_events  enable row level security;
alter table call_events      enable row level security;

-- profiles: users can read/update their own profile
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- Helper function: get client_id for logged-in user
create or replace function my_client_id()
returns uuid language sql security definer stable as $$
  select client_id from profiles where id = auth.uid();
$$;

-- clients: user can only see their own client
create policy "clients_select_own" on clients
  for select using (id = my_client_id());

-- leads: user can only see leads for their client
create policy "leads_select_own_client" on leads
  for select using (client_id = my_client_id());

create policy "leads_insert_own_client" on leads
  for insert with check (client_id = my_client_id());

create policy "leads_update_own_client" on leads
  for update using (client_id = my_client_id());

-- whatsapp_events: scoped to client
create policy "wa_events_select_own_client" on whatsapp_events
  for select using (client_id = my_client_id());

create policy "wa_events_insert_own_client" on whatsapp_events
  for insert with check (client_id = my_client_id());

-- call_events: scoped to client
create policy "call_events_select_own_client" on call_events
  for select using (client_id = my_client_id());

create policy "call_events_insert_own_client" on call_events
  for insert with check (client_id = my_client_id());
