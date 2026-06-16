-- CVivo Row Level Security policies + extra constraints.
-- Apply AFTER `prisma migrate` has created the tables (see quickstart.md).
--
-- NOTE: The application accesses the database through Prisma using a privileged
-- connection that BYPASSES RLS; ownership is also enforced explicitly in every route
-- handler (FR-013). These policies are defense-in-depth for any access made through the
-- Supabase anon/authenticated API roles (e.g. a leaked anon key), per Constitution
-- Principle III (access limited to what a feature requires).

-- ----------------------------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------------------------
alter table users             enable row level security;
alter table cvs               enable row level security;
alter table cv_sections       enable row level security;
alter table slug_reservations enable row level security;
alter table share_links       enable row level security;

-- ----------------------------------------------------------------------------
-- users: a user may only see/modify their own row
-- ----------------------------------------------------------------------------
create policy users_self_select on users for select to authenticated using (id = auth.uid());
create policy users_self_insert on users for insert to authenticated with check (id = auth.uid());
create policy users_self_update on users for update to authenticated using (id = auth.uid());
create policy users_self_delete on users for delete to authenticated using (id = auth.uid());

-- ----------------------------------------------------------------------------
-- cvs: owner-only for authenticated; anon may read a CV that has an ACTIVE share link
-- ----------------------------------------------------------------------------
create policy cvs_owner_all on cvs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy cvs_anon_shared_select on cvs for select to anon
  using (exists (
    select 1 from share_links sl
    where sl.cv_id = cvs.id and sl.status = 'ACTIVE'
  ));

-- ----------------------------------------------------------------------------
-- cv_sections: scoped through the owning CV; anon may read sections of a shared CV
-- ----------------------------------------------------------------------------
create policy cv_sections_owner_all on cv_sections for all to authenticated
  using (exists (select 1 from cvs where cvs.id = cv_sections.cv_id and cvs.user_id = auth.uid()))
  with check (exists (select 1 from cvs where cvs.id = cv_sections.cv_id and cvs.user_id = auth.uid()));

create policy cv_sections_anon_shared_select on cv_sections for select to anon
  using (exists (
    select 1 from share_links sl
    where sl.cv_id = cv_sections.cv_id and sl.status = 'ACTIVE'
  ));

-- ----------------------------------------------------------------------------
-- slug_reservations: owner may read/insert their reservations (never reusable by others)
-- ----------------------------------------------------------------------------
create policy slug_owner_select on slug_reservations for select to authenticated using (user_id = auth.uid());
create policy slug_owner_insert on slug_reservations for insert to authenticated with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- share_links: owner full access; anon may read only ACTIVE links (for slug resolution)
-- ----------------------------------------------------------------------------
create policy share_links_owner_all on share_links for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy share_links_anon_active_select on share_links for select to anon
  using (status = 'ACTIVE');

-- ----------------------------------------------------------------------------
-- Constraint: at most one ACTIVE share link per slug (Prisma can't express a partial
-- unique index, so it lives here).
-- ----------------------------------------------------------------------------
create unique index if not exists idx_share_links_slug_active
  on share_links (slug)
  where status = 'ACTIVE';
