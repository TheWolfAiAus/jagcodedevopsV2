-- Migration: create form_submissions table

create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  site text,
  data jsonb,
  received_at timestamptz default now()
);
