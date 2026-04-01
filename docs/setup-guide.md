# Setup Guide

This guide walks you through setting up SOPSmith from scratch for local development.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Supabase account | [supabase.com](https://supabase.com) |
| Groq API account | [console.groq.com](https://console.groq.com) |

---

## 1. Clone and install

```bash
git clone https://github.com/mahimurrahman/SOPSmith.git
cd SOPSmith
npm install
```

---

## 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in all four variables:

```bash
# Your Supabase project URL — found in Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co

# Public anon/publishable key — found in Supabase API settings
# NEVER use the service_role key here
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Your Groq API key from console.groq.com
GROQ_API_KEY=gsk_...

# A valid Groq chat model, e.g. llama-3.3-70b-versatile
GROQ_MODEL=llama-3.3-70b-versatile
```

The application validates all four at startup and throws a clear error if any are missing or misconfigured.

---

## 3. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In **Authentication → Providers**, enable **Email** (magic link)
3. Optionally enable **Google** OAuth provider
4. In **Authentication → URL Configuration**, set:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`

---

## 4. Apply database migrations

Run the SQL files in `supabase/migrations/` in timestamp order against your Supabase project.

You can do this via the Supabase SQL editor, or with the Supabase CLI:

```bash
# Install Supabase CLI (once)
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

If you have an existing `sops` table in an older schema, also run the repair migration:

```sql
-- supabase/migrations/20260314193000_repair_sops_schema.sql
```

---

## 5. Configure Supabase Storage (for attachments)

1. In Supabase, go to **Storage**
2. Create a bucket named `sop-attachments`
3. Set it to **private** (the app generates signed URLs for downloads)

---

## 6. Configure Google OAuth (optional)

1. In Google Cloud Console, create an OAuth 2.0 client
2. Add this as an authorized redirect URI:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
3. Add the **Client ID** and **Client Secret** to Supabase under **Authentication → Providers → Google**

---

## 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 8. Verify the setup

```bash
npm run lint   # must pass with zero errors
npm run build  # must complete successfully
```

Then follow the [Manual QA flow in the README](../README.md#manual-qa-flow).

---

## Deployment on Vercel

1. Import the repo into [Vercel](https://vercel.com)
2. Add all four environment variables in the Vercel project settings
3. Deploy
4. Copy the final domain and update Supabase URL configuration:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`
5. Redeploy if domain or env variables changed

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `[SOPSmith] Environment configuration error` on startup | A `.env.local` variable is missing or empty |
| Login redirects to `/auth/callback?error=…` | Supabase redirect URLs don't match your domain |
| Groq returns empty or malformed SOP | Model name is wrong or API key is invalid |
| File upload returns 400 | Storage bucket `sop-attachments` does not exist |
| RLS blocks reads/writes | Migrations haven't been applied, or the user session expired |
