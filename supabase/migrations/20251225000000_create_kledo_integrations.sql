create table if not exists public.kledo_integrations (
  id uuid not null default gen_random_uuid (),
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint kledo_integrations_pkey primary key (id)
);

-- Policy to allow authenticated users to read (assuming internal app)
alter table public.kledo_integrations enable row level security;

create policy "Allow internal read access"
  on public.kledo_integrations
  for select
  to authenticated
  using (true);

-- Policy for insert/update (restrict this if needed, but for now allow auth users)
create policy "Allow internal write access"
  on public.kledo_integrations
  for all
  to authenticated
  using (true)
  with check (true);
