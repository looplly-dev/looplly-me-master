-- ============================================
-- Phase 1: Multi-Tenancy Foundation
-- Copy this SQL and run it in Lovable Cloud SQL Editor
-- ============================================

-- Create tenants table
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  api_key text unique,
  settings jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on tenants
alter table public.tenants enable row level security;

-- Tenants policies
create policy "Tenants are viewable by authenticated users"
  on public.tenants for select
  to authenticated
  using (true);

create policy "Only admins can manage tenants"
  on public.tenants for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Add tenant_id to existing tables
alter table public.profiles add column tenant_id uuid references public.tenants(id);
alter table public.user_roles add column tenant_id uuid references public.tenants(id);
alter table public.earning_activities add column tenant_id uuid references public.tenants(id);
alter table public.transactions add column tenant_id uuid references public.tenants(id);

-- Create indexes for tenant_id
create index idx_profiles_tenant_id on public.profiles(tenant_id);
create index idx_user_roles_tenant_id on public.user_roles(tenant_id);
create index idx_earning_activities_tenant_id on public.earning_activities(tenant_id);
create index idx_transactions_tenant_id on public.transactions(tenant_id);

-- ============================================
-- Audit Logging System
-- ============================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id),
  user_id uuid references auth.users(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Enable RLS on audit_logs
alter table public.audit_logs enable row level security;

-- Audit logs policies
create policy "Audit logs viewable by admins"
  on public.audit_logs for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "System can insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (true);

-- Create index for efficient querying
create index idx_audit_logs_tenant_id on public.audit_logs(tenant_id);
create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_resource on public.audit_logs(resource_type, resource_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- ============================================
-- Badge Management Tables
-- ============================================

-- Badges catalog table (for multi-tenant badge definitions)
create table public.badge_catalog (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id),
  badge_id text not null,
  name text not null,
  description text,
  tier text not null,
  category text not null,
  rep_points integer default 0,
  rarity text,
  icon text,
  image_url text,
  requirements jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, badge_id)
);

-- Enable RLS on badge_catalog
alter table public.badge_catalog enable row level security;

-- Badge catalog policies
create policy "Badges viewable by tenant users"
  on public.badge_catalog for select
  to authenticated
  using (
    tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

create policy "Only admins can manage badges"
  on public.badge_catalog for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- User earned badges table
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id),
  badge_id uuid references public.badge_catalog(id),
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- Enable RLS on user_badges
alter table public.user_badges enable row level security;

-- User badges policies
create policy "Users can view their own badges"
  on public.user_badges for select
  to authenticated
  using (user_id = auth.uid());

create policy "System can award badges"
  on public.user_badges for insert
  to authenticated
  with check (true);

-- Create indexes
create index idx_badge_catalog_tenant_id on public.badge_catalog(tenant_id);
create index idx_user_badges_user_id on public.user_badges(user_id);
create index idx_user_badges_tenant_id on public.user_badges(tenant_id);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to get user's tenant_id
create or replace function public.get_user_tenant_id(user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = user_id limit 1;
$$;

-- Function to validate API key and get tenant
create or replace function public.validate_tenant_api_key(api_key_input text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.tenants 
  where api_key = api_key_input 
    and is_active = true 
  limit 1;
$$;

-- Function to log audit event
create or replace function public.log_audit_event(
  p_tenant_id uuid,
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_metadata jsonb default '{}'::jsonb,
  p_ip_address text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_log_id uuid;
begin
  insert into public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    ip_address,
    user_agent
  )
  values (
    p_tenant_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  returning id into v_log_id;
  
  return v_log_id;
end;
$$;

-- ============================================
-- Create default internal tenant
-- ============================================

insert into public.tenants (name, slug, api_key, settings)
values (
  'Looplly Internal',
  'looplly-internal',
  encode(gen_random_bytes(32), 'hex'),
  '{"isInternal": true}'::jsonb
)
on conflict do nothing;
