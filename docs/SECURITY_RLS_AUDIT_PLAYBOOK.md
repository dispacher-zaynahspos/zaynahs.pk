# 🛡️ Supabase RLS / Public-Data Audit Playbook (portable)

> Kisi bhi Supabase + Next.js project ke liye. Copy this file into the target repo
> (or read it directly) and follow it top-to-bottom.
> Project-specific rules live in `docs/agent-rules/32-security-public-data-lock.md`.
> **Never prints keys or customer data. All probes are read-only except the explicit
> apply step.**

Why this exists: the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is **public by design** —
it ships in every browser bundle. RLS + grants are the only wall. A single
`USING (true)` or `auth.role() = 'authenticated'` policy exposes the whole database.

---

## Step 0 — Inventory (5 min)

```bash
# which stores/projects exist
ls env-backups/*.env.local

# per project: ref + url (never print tokens)
grep -E '^(SUPABASE_PROJECT_REF|NEXT_PUBLIC_SUPABASE_URL)=' env-backups/<store>.env.local
```

Write down: project ref, anon key, service role key, admin email(s)
(`NEXT_PUBLIC_ADMIN_EMAIL`), management token (`SUPABASE_MGMT_TOKEN`).

---

## Step 1 — What is exposed RIGHT NOW (read-only probes)

Run with the **anon** key (this is what any visitor can do):

```bash
U=$NEXT_PUBLIC_SUPABASE_URL; K=$NEXT_PUBLIC_SUPABASE_ANON_KEY
for t in orders customers order_items order_addresses abandoned_carts \
         contact_messages page_views email_subscribers whatsapp_subscribers; do
  printf "%-22s %s\n" "$t" "$(curl -s -o /dev/null -w '%{http_code}' "$U/rest/v1/$t?select=id" -H "apikey: $K")"
done
printf "%-22s %s\n" "store_settings" "$(curl -s -o /dev/null -w '%{http_code}' "$U/rest/v1/store_settings?select=id" -H "apikey: $K")"
```

- `200` = **open** → PII/secret leak. `401/403` = closed. ✅
- Also check auth config: `disable_signup` must be `true`.

---

## Step 2 — Inspect policies and grants (management API)

```sql
-- dangerous policies: open to everyone, or any logged-in user = admin
select tablename, policyname, cmd, roles::text, qual, with_check
from pg_policies
where schemaname = 'public'
  and (coalesce(qual,'') = 'true' or coalesce(with_check,'') = 'true'
       or coalesce(qual,'') like '%auth.role()%authenticated%'
       or coalesce(with_check,'') like '%auth.role()%authenticated%')
order by 1,2;

-- who can read what
select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type)
from information_schema.role_table_grants
where table_schema='public' and grantee in ('anon','authenticated')
group by 1,2 order by 1,2;
```

**The #1 silent bug:** `REVOKE SELECT (secret_col) ...` does **nothing** while a
table-level `GRANT SELECT` exists. Always:

```sql
REVOKE SELECT ON public.<table> FROM anon;                       -- drop the table grant
GRANT SELECT (safe_a, safe_b) ON public.<table> TO anon;          -- re-grant safe columns
-- or better: no anon grant at all, expose a `*_public` VIEW instead
```

---

## Step 3 — One admin predicate (never `authenticated`)

```sql
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant all on public.admin_users to service_role;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role','') = 'admin'
      or exists (select 1 from public.admin_users a
                 where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email','')));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
```

- Seed `admin_users` from `NEXT_PUBLIC_ADMIN_EMAIL` **before** rewriting policies.
- Also set `app_metadata.role='admin'` for those auth users (belt & braces).
- Existing sessions keep working because the email claim is already in the JWT → **no admin lockout**.

---

## Step 4 — Rewrite policies (order matters)

1. `DROP POLICY IF EXISTS` every `Public select/insert <pii_table>`.
2. `REVOKE SELECT, INSERT ON public.<pii_table> FROM anon;`
3. Replace `auth.role()='authenticated'` with `public.is_admin()` in **all** policies:
   ```sql
   -- SELECT/DELETE → USING ; INSERT → WITH CHECK only ; UPDATE → both
   ALTER POLICY "p" ON public.t USING (public.is_admin());
   ALTER POLICY "p" ON public.t WITH CHECK (public.is_admin());
   ```
4. Public reads: explicit columns only, or a view granted to anon (`store_settings_public`).

PII tables that must never have an anon SELECT:
`orders`, `order_items`, `order_addresses`, `customers`, `abandoned_carts`,
`contact_messages`, `page_views`, `email_subscribers`, `whatsapp_subscribers`.

---

## Step 5 — Fix the code that depended on the open door

Search the repo for **client-side** reads of those tables:

```bash
grep -rn "from('orders')\|from('customers')\|from('store_settings')" app components lib \
  | grep -v supabaseAdmin | grep -v "use server"
```

Replace with one of:
1. **Server action / server component** using `supabaseAdmin`, scoped by the signed session.
2. **SECURITY DEFINER RPC** returning masked fields only.
3. **Public view** with zero PII.

Also ban in review: `select('*')` with an anon client. List the public columns.

---

## Step 6 — Auth on every privileged route

Grep for routes with no guard:

```bash
grep -rLn "requireAdmin\|CRON_SECRET\|x-revalidate-secret" app/api --include=route.ts
```

Every admin/quota/mail/cron route must call the shared `requireAdmin(req)` (or verify
`CRON_SECRET` for crons). A dev-only bypass (`?secret=local-bypass`) must be
`process.env.NODE_ENV !== 'production'`-gated.

---

## Step 7 — Apply, then verify (definition of done)

```bash
npm run security:lock     # idempotent; seeds admin_users, disables signup, applies policies
npm run security:verify   # read-only probes; fails on any open leak
```

Expected per project:

```
orders               401 CLOSED
storeSettingsSecrets 401 CLOSED
reviewsPii           401 CLOSED
reviewsPublic        200 OK      <- public content must still work
settingsView         200 OK      <- storefront settings must still work
```

Then smoke-test real pages: home / shop / product / reviews / cart / order tracking = 200,
`/admin` = 307 → login, admin login with bad creds = 401 (not 500).

---

## Step 8 — Aftercare (owner actions)

- Rotate any secret that was readable (AI, SMTP, courier, payment) — closing the door
  does not un-leak a key.
- Remove tokens embedded in git remote URLs (`https://user:ghp_xxx@...`); use SSH.
- Keep `disable_signup = true`; add admins only via `admin_users` + `app_metadata`.
- Add a new table → `ENABLE RLS` + `REVOKE ALL` + minimum grants, same PR.
- Verify in CI/prebuild (`npm run check:setup` / `security:verify`).

---

## Common mistakes (all seen in real audits)

| Mistake | Result |
|---|---|
| `USING (true)` on `orders` | every order + `access_token` public |
| `auth.role() = 'authenticated'` + open signup | any visitor becomes DB admin |
| `REVOKE SELECT (col)` without dropping the table grant | no-op, secret stays public |
| `select('*')` from an anon client | breaks the moment columns are revoked; leaks before |
| public INSERT on `orders` | bots write fake orders, bypassing checkout shield |
| dev bypass secret shipped to prod | anyone triggers crons |
| long CF cache TTL blamed for staleness | wrong fix — debug purge, never shorten the TTL |
