create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  password_hash text not null,
  is_activated boolean not null default false,
  payment_proof_url text not null,
  created_at timestamptz not null default timezone('utc', now()),
  activated_at timestamptz
);

create index if not exists app_users_activation_idx
  on public.app_users (is_activated, created_at desc);

alter table public.app_users disable row level security;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

create policy "Public can upload payment proofs"
on storage.objects
for insert
to anon
with check (bucket_id = 'payment-proofs');

create policy "Public can view payment proofs"
on storage.objects
for select
to anon
using (bucket_id = 'payment-proofs');
