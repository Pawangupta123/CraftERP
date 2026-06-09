# Handicraft Export ERP — Planning Document

> **Status:** Living document. Naye decisions aate rahenge — yahin add karenge.
> **Last decisions:** Real production system · Fresh start (purana demo follow NAHI karna) · Supabase backend · Modern clean UI · Dashboard important.

---

## 1. Project kya hai (Overview)

Yeh ek **handicraft export business** ka ERP hai. Business wooden/iron handicraft & furniture items banata hai aur foreign buyers (US, Europe, etc.) ko export karta hai.

**Pura lifecycle:**

```
Buyer PO bhejta hai
      ↓
Admin system me PO banata hai (buyer + items + quantity + dates + photo)
      ↓
Items (SKU) production me jaate hain  →  Manager daily stage update karta hai
      ↓
Raw material issue hota hai  →  Store Manager inventory me entry karta hai
      ↓
Container me ship hota hai  →  Challan print hoti hai (auto Total CFT ke saath)
      ↓
Payment aati hai (USD/EUR)  →  Admin manually enter karta hai (BL/BRC, conversion rate)
```

Pura software isi cycle ke around bana hai.

---

## 2. Tech Stack

| Layer | Choice | Note |
|-------|--------|------|
| Framework | **Next.js (App Router)** | Full-stack — frontend + API ek hi jagah |
| Language | TypeScript | Type safety |
| Database | **Supabase (PostgreSQL)** | Relational — ERP ke relationships ke liye perfect |
| Auth | **Supabase Auth** | 4 roles ka login |
| File/Photo storage | **Supabase Storage** | Photos yahan, DB me sirf URL (DB me image NAHI) |
| Access control | **Supabase RLS (Row Level Security)** | Role ke hisaab se kaun kya dekhe |
| Styling | **Tailwind CSS v4** | Fresh design (purana demo follow nahi) |
| UI components | **shadcn/ui** (Radix + Tailwind) | Ready-made accessible components: tables, dialogs, forms, toasts |
| Print/PDF | Challan & PO print/download | Browser print → PDF |

> ⚠️ **Photo rule:** Requirement me "DB me store hoga" likha tha, par real production me image DB me daalna galat hai (slow + heavy backup). Sahi tarika → **Supabase Storage me file, DB me uska link**. User ko same dikhega.

> 📌 **Next.js note (AGENTS.md):** Is project ka Next.js modified hai. Code likhne se PEHLE `node_modules/next/dist/docs/` ki relevant guide padhni hai.

**Next.js 16 key conventions (docs se confirm):**
- `params` aur `searchParams` ab **Promise** hain → `await` karna padta hai.
- `cookies()` aur `headers()` ab **async** hain → `await`.
- **Middleware ka naam badal ke `proxy.ts`** ho gaya (root/`src` me). Auth redirect yahin.
- Data mutation = **Server Actions** (`'use server'`).
- Supabase auth ke liye official **`@supabase/ssr`** package (cookie-based session).

---

## 3. User Roles & Permissions

4 roles. ~80% control Admin ke paas.

| Role | Kya kar sakta hai |
|------|-------------------|
| **Admin** | Sab kuch — dashboard, buyer add, SKU, PO create, payments, reports, users |
| **Operator** | Bill inward + inventory entry |
| **Manager** | In-house production ka daily stage update |
| **Store Manager** | Hardware/material issue + inventory |

**Permission matrix (V1 draft — RLS se enforce hoga):**

| Module | Admin | Operator | Manager | Store Mgr |
|--------|:-----:|:--------:|:-------:|:---------:|
| Dashboard | ✅ full | ⬜ | ⬜ | ⬜ |
| Buyers | ✅ | 👁️ view | 👁️ | ⬜ |
| SKU / Procurement | ✅ | ✅ add | 👁️ | 👁️ |
| Purchase Orders | ✅ create | 👁️ | 👁️ | 👁️ |
| Production stages | ✅ | ⬜ | ✅ update | ⬜ |
| Inventory issue | ✅ | ✅ entry | ⬜ | ✅ issue |
| Payments | ✅ | ⬜ | ⬜ | ⬜ |

(✅ full · 👁️ view-only · ⬜ no access — yeh draft hai, finalize karenge)

---

## 4. Data Model (sabse important hissa)

### Relationships (ER diagram)

```
User (role)

Buyer ──< PurchaseOrder ──< PO_LineItem >── SKU
              │                  │
              │                  └──< StageTracking
              │
              └──< Payment

SKU ──< WoodComponent       (L, T, B, Qty — multiple "+" rows)
    ──< IronComponent        (optional)
    ──< HardwareComponent
    ──< PackagingComponent

InventoryIssue (item, issued-to, date, qty)
```

`──<` = one-to-many (ek ke neeche bahut). Jaise: ek buyer ke bahut PO, ek SKU me bahut wood rows.

### Tables / Fields

**users** — `id, name, email, role (admin|operator|manager|store_manager), created_at`

**buyers** — `id, name, address, email, country, created_at`

**skus** — `id, sku_no (auto/manual), name, photo_url, description, remark, created_at`

**wood_components** — `id, sku_id, description, length, thickness, breadth, quantity`
> Ek SKU me multiple rows ho sakte hain ("+" Add More).

**iron_components** *(optional)* — `id, sku_id, description, section, length, width, remark, picture_url`

**hardware_components** — `id, sku_id, serial_no (auto), name, description, quantity, unit`

**packaging_components** — `id, sku_id, corrugated_box, labels, barcode, corners`

**purchase_orders** — `id, po_no, buyer_id, photo_url, delivery_date, inspection_date, shipping_date, shipping_country, status (upcoming|in_progress|completed), created_at`

**po_line_items** — `id, po_id, sku_id, quantity`
> **CFT yahin calculate hota hai:** single-piece wood volume × quantity.

**stage_tracking** — `id, po_line_item_id, current_stage, updated_by, updated_at`

**payments** — `id, po_id, date, amount, currency (INR|USD|EUR), conversion_rate, percentage, container_no, remark, bl (bool), brc (bool), created_at`

**inventory_issues** — `id, item_name, issued_to_name, quantity, unit, date, issued_by (store_mgr), remark`

---

## 5. CFT Logic (crucial feature)

1. **SKU add karte waqt:** user sirf ek piece ki dimension daalta hai → L × T × B + Qty. **Koi calculation nahi.**
2. **PO generate karte waqt:** SKU-001, quantity = 100.
3. **System backend me:** `(single piece wood volume) × 100`.
4. **Challan copy me:** Total CFT auto dikhega → direct print.

**Formula (unit configurable):**
- Inches → `CFT = (L × B × T) ÷ 1728`
- CM → `CFT = (L × B × T) ÷ 28316.8`
- Feet → `CFT = L × B × T`

> Ek SKU me multiple wood rows ho to sabka volume add hoga, phir × quantity.
> **Unit abhi TBD** — isliye unit ko ek setting bana denge (client jo bole set kare).

---

## 6. Modules (screen-wise)

### A. Dashboard (Admin) — *yaad rakhna hai*
KPIs/widgets:
- Total POs + status breakdown (Upcoming / In Progress / Completed)
- Pending vs received payments
- Production: kitne items kis stage me
- Inventory alerts (agar stock tracking add karein)
- Total CFT shipped (period-wise)
- Recent activity feed

### B. Buyers
- Add buyer: Name, Address, Email, Country
- Buyer list + buyer-wise PO view

### C. Procurement / SKU (sabse bada part)
Basic: SKU No (auto/manual), Name, Photo, Description, Remark
+ 4 raw-material sections:
- **Wood** — Description, L, T, B, Qty + **"+" Add More** (unlimited rows)
- **Iron** *(optional)* — Description, Section, Length, Width, Remark, Picture
- **Hardware** — Serial No (auto), Name, Description, Qty, Unit
- **Packaging** — Corrugated Box, Labels, Barcode, Corners

### D. Purchase Orders
- Create PO: Photo, Delivery/Inspection/Shipping dates, Shipping Country, line items (SKU + qty)
- Print + Download
- **Buyer-wise tracking:** status 3 categories — Completed / In Progress / Upcoming
- **PO detail table:** patli, simple table — line-by-line SKU No + uska current Stage

### E. Inventory & Store
- Store Manager item issue karta hai
- Filters: **Date-wise · Name-wise (jisko issue kiya) · Item-name-wise**

### F. Payments
- PO select → Date, Amount, Remark, Percentage, Container No
- Currency USD/EUR → manual **conversion rate**
- **BL & BRC** → Yes/No toggle

### G. Reports
- **Challan copy** — auto Total CFT, printable
- **PO print/download**

---

## 7. UI / Design Direction (fresh — purana demo follow NAHI)

- **Look:** clean, modern, professional ERP. Halka background, white cards, soft shadows, rounded corners.
- **Layout:** left sidebar navigation + top header (user + role badge). Content area me cards + clean tables.
- **Tables:** patli, readable (PO detail table requirement "thin & simple" thi).
- **Colors:** ek primary brand color (logo se), neutral greys, status colors (green = completed, amber = in-progress, blue = upcoming).
- **Forms:** SKU form me sections clear (Wood/Iron/Hardware/Packaging accordions ya tabs), "+" add-row clean.
- **Responsive:** desktop-first (ERP zyada desktop pe chalta hai), par mobile pe tootna nahi chahiye.

> Branding (logo, company name, color) client se lena hai — neeche "Need from you" me.

---

## 8. Build Phases (Roadmap)

| Phase | Kaam | Depends on |
|-------|------|-----------|
| **0 — Foundation** | Next.js fresh setup + Supabase connect + DB schema + Auth (4 roles) | — |
| **1 — Masters** | Buyer add · SKU add (4 raw-material sections) | Phase 0 |
| **2 — Purchase Orders** | PO create (line items, dates, photo) · buyer-wise tracking (3 status) · PO detail table | Phase 1 |
| **3 — Operations** | Production stage update · Inventory issue + filters | Phase 1 |
| **4 — Money** | Payments (multi-currency, BL/BRC) | Phase 2 |
| **5 — Output** | Challan + PO print/download with auto CFT | Phase 2 |
| **6 — Dashboard** | Admin dashboard with live KPIs | Phase 2–4 |

Rule: pehle masters, phir transactions. Sequence isliye important hai.

---

## 9. Open Questions (jab pata chale, yahan bharenge)

- [ ] **CFT unit** — inches / cm / feet? (default kya)
- [ ] **Production stages** exact list — e.g. Wood cutting → Assembly → Finishing → Polish → QC → Packing → Dispatch?
- [ ] **Inventory depth** — sirf issue log, ya actual stock count + low-stock alert?
- [ ] **Challan / PO print** ka exact format (sample chahiye)
- [ ] **SKU No** — auto format kya (e.g. SKU-001) ya manual?
- [ ] **Multi-buyer per container?** ya ek container = ek PO?
- [ ] Aur features jo client baad me batayega...

---

## 10. Need from you (kaam shuru karne ke liye)

1. ✅ **Supabase project** — keys `.env.local` me hain. Tum dashboard me karo: schema.sql run · `uploads` storage bucket · Email auth on · signup karke khud ko admin set (steps `SUPABASE_SETUP.md` me).
2. ⏳ **Branding** — company name, logo, pasand ka color.
3. ⏳ **Production stages** ki list (e.g. Cutting → Assembly → Finishing → Polish → QC → Packing → Dispatch).
4. ⏳ **Sample Challan / PO format** (photo ya description).
5. ✅ **Purana demo** — delete kar diya. Fresh start chal raha hai.
