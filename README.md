# SOPSmith

SOPSmith is a focused AI SaaS that turns rough operational notes into clean, structured Standard Operating Procedures.

It is built for solo founders, operators, agencies, and small teams that need usable SOPs fast without setting up a heavy documentation system.

## What The Product Does

SOPSmith takes messy source notes like bullets, handoff comments, half-written steps, and process reminders, then turns them into a practical SOP with a consistent structure:

- `# Title`
- `## Purpose`
- `## Scope`
- `## Tools Needed`
- `## Inputs`
- `## Steps`
- `## Quality Checks`
- `## Checklist`
- `## Notes`

Each generated SOP is saved to a private library for the signed-in user, can be reopened later, and can be copied anywhere the team already works.

## Who It Is For

- Solo founders documenting repeatable workflows
- Operators building process clarity without a big ops stack
- Agencies standardizing internal handoffs and delivery steps
- Small teams that need a lightweight SOP workflow instead of a complex knowledge base

## Core MVP Scope

- Landing page
- Email magic link login
- Google OAuth login
- Supabase auth callback flow
- Protected SOP library
- Guided new SOP form
- Groq-powered SOP generation
- Supabase persistence under row level security
- SOP detail view with copy-to-clipboard
- Loading, error, empty, and not-found states

The product intentionally does not include billing, teams, collaboration, templates marketplace, analytics dashboards, admin panels, or PDF export.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Supabase SSR auth
- Supabase Postgres with RLS
- Groq chat completions API
- Zod for validation

## Product Story

SOPSmith is intentionally narrow:

1. Start with rough notes.
2. Generate a structured SOP.
3. Save it to a private library.
4. Reopen and copy it when needed.

That focus makes it a good example of a solo-founder-friendly AI workflow product: one painful job, one clear output, and one reliable storage/retrieval loop.

## Architecture Overview

### Frontend

- App Router pages and layouts in [`app/`](app)
- Tailwind-based dark UI
- Mostly server components, with small client components only where interactivity is needed
- Server actions used for internal writes like magic link requests, SOP creation, and sign-out

### Auth

- Supabase SSR client setup for:
  - browser usage in [`lib/supabase/browser.ts`](lib/supabase/browser.ts)
  - server usage in [`lib/supabase/server.ts`](lib/supabase/server.ts)
  - session refresh and route protection in [`lib/supabase/proxy.ts`](lib/supabase/proxy.ts)
- Root-level [`proxy.ts`](proxy.ts) protects dashboard routes before rendering
- Server-side user checks still run inside protected pages and layouts for defense in depth

### AI Generation

- Prompt definitions live in [`lib/groq/prompts.ts`](lib/groq/prompts.ts)
- Groq API client lives in [`lib/groq/client.ts`](lib/groq/client.ts)
- Validation and normalization live in [`lib/groq/validation.ts`](lib/groq/validation.ts)
- The orchestration layer lives in [`lib/groq/index.ts`](lib/groq/index.ts)

### Data Layer

- SOP queries and mutations are centralized in [`lib/sops/repository.ts`](lib/sops/repository.ts)
- Validation schemas are centralized in [`lib/validation/schemas.ts`](lib/validation/schemas.ts)
- Shared runtime env access is centralized in [`lib/config/env.ts`](lib/config/env.ts)
- Shared error shaping is centralized in [`lib/errors.ts`](lib/errors.ts)

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

Migration files live in [`supabase/migrations/`](supabase/migrations).

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
   - [`supabase/migrations/20260314193000_repair_sops_schema.sql`](supabase/migrations/20260314193000_repair_sops_schema.sql)

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
7. Confirm the app redirects to the detail page
8. Confirm the SOP appears in the library
9. Confirm copy-to-clipboard works
10. Confirm a fake SOP URL shows not-found
11. Confirm signed-out users cannot access protected routes

## Why This Works Well As A Portfolio Project

SOPSmith shows a credible real-world AI SaaS without pretending to be bigger than it is. It demonstrates:

- App Router architecture
- SSR auth with Supabase
- protected routes and callback handling
- prompt engineering plus output validation
- AI generation as part of a real CRUD workflow
- RLS-based multi-user data isolation
- clean MVP scoping instead of feature bloat

It is a strong example of shipping a practical AI workflow product with thoughtful technical tradeoffs.
