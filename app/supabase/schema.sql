-- Page configuration is separate from payment records and existing API migrations.
create table public.cause_page_settings (
  cause_id uuid primary key references public.causes(id) on delete cascade,
  publish_ready boolean not null default false,
  featured boolean not null default false,
  image_url text check (image_url is null or image_url ~ '^https://'),
  funding_goal numeric(12,2) check (funding_goal is null or funding_goal > 0),
  currency text not null default 'CAD' check (currency ~ '^[A-Z]{3}$'),
  campaign_start timestamptz,
  campaign_end timestamptz,
  updated_at timestamptz not null default now(),
  check (campaign_end is null or campaign_start is null or campaign_end > campaign_start)
);
alter table public.cause_page_settings enable row level security;
revoke all on public.cause_page_settings from anon, authenticated;
grant select, insert, update, delete on public.cause_page_settings to service_role;
comment on table public.cause_page_settings is 'Editorial and funding-goal settings for the public causes embed. No settings are seeded for placeholder causes. Server-only access; the public endpoint projects published approved causes and aggregate funding only. Goals describe the lifetime total for a cause; dates are informational and do not reset its ledger.';
