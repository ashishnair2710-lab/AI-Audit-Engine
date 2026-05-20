# Client CRM Portal — Al Huzaifa Furniture

A white-label client portal demonstrating how leads are captured, followed up via WhatsApp, called via AI voice, and summarised by Claude AI.

Built with **Next.js 14 App Router**, **Supabase**, **Tailwind CSS**, and **Recharts**.

---

## Demo

**Login credentials:**
- Email: `demo@alhuzaifa.ae`
- Password: `demo123`

The app works fully with seeded mock data — no backend connection required for the demo.

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login with demo credentials |
| `/dashboard` | Metrics overview + recent leads + 7-day bar chart |
| `/leads` | Full leads table with search + filters |
| `/leads/[id]` | Lead detail — AI summary, transcript, timeline |
| `/reports/whatsapp` | WhatsApp report — metrics + 30-day line chart |
| `/reports/calls` | Voice calls report — metrics + 30-day bar chart |
| `/settings` | Settings placeholder |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

For the demo (no Supabase required), the app uses static mock data and no env vars are needed to run locally.

To connect real Supabase, fill in the two vars in `.env.local`.

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the demo credentials.

---

## Supabase Setup (for production)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the schema migration

In the Supabase **SQL Editor**, paste and run:

```
supabase/migrations/001_schema.sql
```

This creates all tables with RLS policies enabled.

### 3. Seed demo data

In the SQL Editor, paste and run:

```
supabase/seed.sql
```

### 4. Create demo user

In **Supabase Auth → Users**, create:
- Email: `demo@alhuzaifa.ae`
- Password: `demo123`

Then in the SQL Editor, link the user to the client:

```sql
insert into profiles (id, client_id, full_name, role)
values ('<paste-auth-user-uuid-here>', '00000000-0000-0000-0000-000000000001', 'Demo Admin', 'admin');
```

### 5. Update .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked for environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add the two environment variables under **Project Settings → Environment Variables**
4. Deploy

### Option C — One-click (after GitHub push)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Project Structure

```
app/
  (portal)/           # Authenticated layout (sidebar + topbar)
    dashboard/        # Overview page
    leads/            # Leads table
      [id]/           # Lead detail
    reports/
      whatsapp/       # WhatsApp report
      calls/          # Voice calls report
    settings/         # Settings placeholder
  login/              # Public login page
  layout.tsx          # Root layout (Outfit font)
  page.tsx            # Redirect → /login

components/
  Sidebar.tsx         # Fixed left sidebar navigation
  TopBar.tsx          # Fixed top bar with client name + logout
  MetricCard.tsx      # KPI stat card
  StatusBadge.tsx     # Coloured status pill
  SourceBadge.tsx     # Source pill (Meta/Google/Website/TikTok)
  LeadsBarChart.tsx   # 7-day bar chart (Recharts)
  WhatsappLineChart.tsx # 30-day line chart
  CallsBarChart.tsx   # 30-day bar chart
  LeadsTableClient.tsx # Filterable leads table (client component)
  LeadDetailClient.tsx # Collapsible transcript (client component)

lib/
  types.ts            # TypeScript interfaces
  mock-data.ts        # 50 UAE demo leads + helper functions
  supabase.ts         # Supabase browser client

supabase/
  migrations/
    001_schema.sql    # Tables + RLS policies
  seed.sql            # Demo data
```

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 14.2.3 | Framework (App Router) |
| React | 18.3.1 | UI |
| TypeScript | 5.4 | Type safety |
| Tailwind CSS | 3.4.3 | Styling |
| Recharts | 2.12 | Charts |
| Supabase | 2.43 | Auth + Database |
| Outfit (Google Fonts) | — | Typography |

---

## Colour System

| Token | Hex | Usage |
|-------|-----|-------|
| Brand Purple | `#6B5FE4` | Primary buttons, accents |
| Purple Light | `#8B7FF5` | Hover states |
| Purple Hover | `#5A4FD4` | Active hover |
| Brand Yellow | `#F5A623` | Secondary CTA |
| Gray BG | `#F5F5F5` | Page background |
| Border | `#E5E5E5` | Card borders |
| Muted | `#9CA3AF` | Helper text |
| Subtext | `#374151` | Secondary body |
