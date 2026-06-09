# Supabase Setup — Handicraft ERP

Project: `jkulinsmypwjbdykttoh` · URL: `https://jkulinsmypwjbdykttoh.supabase.co`

Keys already saved in `.env.local` (gitignored). ✅

---

## Setup status

### 1. Database schema — ✅ DONE (Claude ne Supabase MCP se apply kiya)
Saari 12 tables + RLS + 4 roles live hain. Security advisors clean. Canonical SQL: `supabase/schema.sql`.

### 2. Storage `uploads` bucket — ✅ DONE (MCP se ban gaya)
Public bucket ready (secure, broad listing off). Photos yahan jaayengi (`skus/`, `pos/`, `iron/`), DB me sirf URL.

---

## Tumhe ab sirf 2 cheezein karni hain

### 3. Email login on karo
1. Dashboard → **Authentication** → **Sign In / Providers**
2. **Email** provider enabled hona chahiye (default on hota hai)
3. *(Optional, internal team ke liye easy)*: "Confirm email" OFF kar sakte ho taaki naye users ko email verify na karna pade

### 4. Khud ko Admin banao
1. Pehle app me signup karoge (ya dashboard → Authentication → Add user) — tab `profiles` me row ban jaayegi `operator` role ke saath
2. Phir SQL Editor me yeh chala ke khud ko admin banao (apna email daalo):
   ```sql
   update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
   ```

---

## Keys reference (already in .env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://jkulinsmypwjbdykttoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        (public, safe)
SUPABASE_SERVICE_ROLE_KEY=...            (SECRET — server only, never commit/expose)
```

⚠️ **service_role key** kabhi frontend/git me mat daalna. Leak lage to dashboard → Settings → API se **rotate** kar dena.

---

## Roles (schema me built-in)
`admin` · `operator` · `manager` · `store_manager` — access control RLS policies se enforce hota hai (schema.sql me defined).
