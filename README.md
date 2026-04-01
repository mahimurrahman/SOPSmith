# SOPSmith

> **Turn rough operational notes into clean, structured SOPs — in seconds.**

SOPSmith is a focused AI SaaS that converts messy process notes, bullets, and handoff comments into professional Standard Operating Procedures. Built for speed, simplicity, and reliability.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mahimurrahman/SOPSmith)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✨ What SOPSmith Does

Paste your rough notes. Get a polished SOP with every section your team needs:

| Section | Purpose |
|---|---|
| `# Title` | Clear, searchable SOP name |
| `## Purpose` | Why this procedure exists |
| `## Scope` | What it covers and who follows it |
| `## Tools Needed` | Software, hardware, resources required |
| `## Inputs` | What must be ready before starting |
| `## Steps` | Numbered, actionable instructions |
| `## Quality Checks` | How to verify work is done correctly |
| `## Checklist` | Quick-reference checkboxes |
| `## Notes` | Edge cases, exceptions, and context |

Each generated SOP is saved to your private library — reopenable, copyable, downloadable as TXT or PDF.

---

## 🎯 Who It Is For

- **Solo founders** documenting repeatable workflows before hiring
- **Operators** building process clarity without a heavy docs stack
- **Agencies** standardising internal handoffs and delivery steps
- **Small teams** that need SOPs fast, not a complex knowledge base

---

## 🚀 Features

- **⚡ Instant generation** — Groq-powered LLM produces structured SOPs in ~2 seconds
- **🔒 Private library** — every SOP saved under your account with row-level security
- **📎 File attachments** — attach PDF, DOC, DOCX, TXT reference files to any SOP
- **📋 Multi-format copy** — copy as Markdown, Notion-ready, or plain text
- **⬇️ Export** — download as TXT or open a print-ready PDF
- **🔄 Regenerate** — re-run generation from the original notes at any time
- **🔍 Search** — instantly filter your library by title
- **🌗 Dark / light mode** — system-aware with manual toggle
- **⌨️ Keyboard shortcuts** — `Cmd+Enter` to generate
- **♿ Accessible** — ARIA roles, keyboard navigation, focus states throughout
- **🛡️ Robust validation** — Zod schemas + auto-repair pass for AI output
- **📱 Responsive** — mobile-first layout, works on all screen sizes

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Supabase SSR (magic link + Google OAuth) |
| Database | Supabase Postgres with RLS |
| Storage | Supabase Storage |
| AI | Groq chat completions API |
| Validation | Zod v4 |

---

## 🗂️ Project Structure

```text
app/
  api/sops/          # REST endpoints for attachments
  auth/callback/     # OAuth callback handler
  dashboard/         # Protected library, new SOP form, detail view
  login/             # Magic link + Google OAuth login page
components/
  auth/              # LoginForm
  dashboard/         # CopyButton, CreateSopForm, DownloadButtons, …
  layout/            # AppShell, AppSidebar, SiteHeader, …
  ui/                # Button, Card, Toast, ThemeToggle, …
lib/
  auth/              # Session helpers, magic link, callback
  config/            # Zod-validated runtime environment
  groq/              # Prompts, client (with retry/backoff), validation
  sops/              # Repository, types, error messages
  attachments/       # Storage helpers, validation, types
  supabase/          # Browser + server Supabase clients, proxy
  validation/        # Shared Zod schemas
supabase/
  migrations/        # SQL migration files
docs/                # Setup guide, architecture overview
```

---

## 🏛️ Architecture Overview

### Frontend

- App Router pages and layouts in [`app/`](./app)
- Tailwind-based UI with light/dark mode (CSS custom properties)
- Mostly server components; client components only where interactivity is needed
- Server actions for writes: magic link, SOP creation, sign-out

### Auth

- Supabase SSR client setup for:
  - browser usage in [`lib/supabase/browser.ts`](./lib/supabase/browser.ts)
  - server usage in [`lib/supabase/server.ts`](./lib/supabase/server.ts)
  - session refresh and route protection in [`lib/supabase/proxy.ts`](./lib/supabase/proxy.ts)
- Root-level [`proxy.ts`](./proxy.ts) protects dashboard routes before rendering
- Server-side user checks still run inside protected pages and layouts for defence in depth

### AI Generation

- Prompt definitions live in [`lib/groq/prompts.ts`](./lib/groq/prompts.ts)
- Groq API client (with exponential-backoff retry) lives in [`lib/groq/client.ts`](./lib/groq/client.ts)
- Validation and normalisation live in [`lib/groq/validation.ts`](./lib/groq/validation.ts)
- The orchestration layer (generation + auto-repair + caching) lives in [`lib/groq/index.ts`](./lib/groq/index.ts)

### Data Layer

- SOP queries and mutations are centralised in [`lib/sops/repository.ts`](./lib/sops/repository.ts)
- Validation schemas are centralised in [`lib/validation/schemas.ts`](./lib/validation/schemas.ts)
- Shared runtime env access is centralised in [`lib/config/env.ts`](./lib/config/env.ts)
- Shared error shaping is centralised in [`lib/errors.ts`](./lib/errors.ts)

## Auth Flow

### Magic Link

1. User enters an email on `/login`
2. A server action requests `signInWithOtp` from Supabase
3. Supabase emails a magic link
4. The link returns to `/auth/callback`
5. The callback exchanges the code for a session and redirects to `/dashboard`

### Google OAuth

1. User clicks `Continue with Google`
2. The browser Supabase client starts `signInWithOAuth`
3. Google authenticates the user through Supabase
4. Supabase returns to `/auth/callback`
5. The callback exchanges the code for a session and redirects to `/dashboard`

### Protected Routes

- `/dashboard`
- `/dashboard/new`
- `/dashboard/[id]`

These routes are protected twice:

- at the proxy layer
- at the server component / server action layer

## AI Generation Flow

1. User submits a title and rough notes on `/dashboard/new`
2. A server action validates the input with Zod
3. The action verifies the authenticated user
4. The action checks the `public.sops` table shape
5. The action sends the prompt to Groq
6. The response is validated for:
   - required heading order
   - numbered steps
   - checklist format
   - non-malformed output
7. If the first draft is invalid, one repair pass is attempted
8. If valid, the SOP is inserted into Supabase under the current user
9. The app redirects to `/dashboard/[id]`

## Database Design

Main table: `public.sops`

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `title text not null`
- `raw_notes text not null`
- `content text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Also included:

- `updated_at` trigger
- index on `(user_id, created_at desc)`
- row level security
- policies limiting reads and writes to `auth.uid() = user_id`

Migration files live in [`supabase/migrations/`](./supabase/migrations).

## Key Technical Decisions

- **Supabase SSR auth instead of client-only auth**
  Keeps protected routes reliable in App Router and works well with server components.

- **Server actions for internal writes**
  Keeps the create/login/sign-out path simple without adding unnecessary API routes.

- **RLS for normal CRUD**
  The app uses the public Supabase client plus auth cookies for normal user data access, not a service-role key.

- **Plain-text SOP output**
  Keeps generation simple, copyable, and easy to validate without a heavy editor.

- **Prompt + validation + repair pass**
  Makes output more reliable than prompt-only generation.

## Key Product Decisions

- **Narrow scope**
  One clear job: rough notes in, usable SOP out.

- **Minimal form**
  Users do not need a template builder or complex onboarding to get value.

- **Library-first workflow**
  Generated SOPs are saved immediately so the product feels useful after the first successful run.

- **Dark, minimal UI**
  Keeps the product feeling focused and premium without adding heavy UI dependencies.

## Project Structure

```text
app/
  auth/
  dashboard/
  login/
components/
  auth/
  dashboard/
lib/
  auth/
  config/
  groq/
  sops/
  supabase/
  validation/
supabase/
  migrations/
```

## Environment Variables

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
GROQ_MODEL=
```

Important notes:

- `NEXT_PUBLIC_SUPABASE_URL` should normally be your hosted Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be the public anon or publishable key.
- Never expose a Supabase secret or service-role key to the browser.
- `GROQ_MODEL` must be a valid Groq chat model available to your account.

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Create env vars

Create `.env.local` from `.env.example`.

### 3. Configure Supabase

1. Create a Supabase project
2. Enable Email auth
3. Enable Google auth if you want Google sign-in
4. Add local auth URLs:
   - `Site URL`: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
5. Apply the SQL migrations in timestamp order
6. If the table already existed in an older shape, also run the repair migration:
   - [`supabase/migrations/20260314193000_repair_sops_schema.sql`](./supabase/migrations/20260314193000_repair_sops_schema.sql)

### 4. Configure Google OAuth

If Google login is enabled:

1. Create or open your Google OAuth app
2. Add this authorized redirect URI in Google Cloud:

   ```text
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

3. Add the Google client ID and secret in Supabase

### 5. Configure Groq

1. Create a Groq API key
2. Put it in `GROQ_API_KEY`
3. Set `GROQ_MODEL` to a valid chat model

### 6. Run the app

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Deployment

### Vercel

1. Import the repo into Vercel
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
   - `GROQ_MODEL`
3. Deploy once to get the final domain
4. Update Supabase URL Configuration:
   - `Site URL`: `https://your-domain.com`
   - Redirect URL: `https://your-domain.com/auth/callback`
5. Redeploy if needed after env or domain changes

### Supabase Production Checklist

1. Apply all migrations in production
2. Confirm RLS is enabled on `public.sops`
3. Confirm policies scope rows to the signed-in user
4. Confirm Email auth is enabled
5. Confirm Google is enabled if the Google button is visible
6. Confirm production callback URLs exactly match the deployed domain

## Verification

Run:

```bash
npm run lint
npm run build
```

## Manual QA Flow

1. Open the landing page
2. Sign in with magic link
3. Sign out
4. Sign in with Google if enabled
5. Open `/dashboard`
6. Create a new SOP
7. Confirm the app redirects to the detail page with a confetti animation
8. Confirm the SOP appears in the library
9. Confirm multi-format copy-to-clipboard works (Markdown, Plain Text, Notion)
10. Confirm TXT download and PDF print work
11. Confirm `Cmd+Enter` on the new SOP form submits the generation
12. Confirm a fake SOP URL shows not-found
13. Confirm signed-out users cannot access protected routes

---

## Documentation

| Document | Purpose |
|---|---|
| [docs/setup-guide.md](./docs/setup-guide.md) | Full local and production setup walkthrough |
| [docs/contributing.md](./docs/contributing.md) | Code style, commit conventions, PR checklist |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and change log |

---

## License

[MIT](./LICENSE) © SOPSmith
