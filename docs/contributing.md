# Contributing to SOPSmith

Thank you for your interest in contributing! This guide covers how to get the project running locally, how the codebase is structured, and what to keep in mind when opening a pull request.

---

## Development setup

Follow the [Setup Guide](./setup-guide.md) to get a working local environment.

---

## Code style

- **TypeScript** — all new code must be typed; avoid `any`
- **Tailwind CSS v4** — use design tokens via CSS custom properties (`var(--accent)`, `var(--surface)`, etc.) rather than raw Tailwind colour classes where possible
- **Server components by default** — only add `"use client"` when interactivity is genuinely required
- **Server actions for writes** — do not add new API routes for operations that can be server actions
- **Zod for all validation** — user inputs, environment variables, and external API responses must be validated with Zod
- **No `console.log` in committed code** — use `console.error` with a structured `[module:function]` prefix for error logging

---

## Commit conventions

Use short, imperative commit messages with a type prefix:

```
feat: add PDF export with print-ready layout
fix: handle empty Groq response gracefully
chore: update dependencies
docs: add architecture diagram to /docs
refactor: extract SOP parsing into lib/sops/parser.ts
```

---

## Branch naming

```
feat/short-description
fix/short-description
chore/short-description
```

---

## Pull request checklist

Before opening a PR:

- [ ] `npm run lint` — zero errors
- [ ] `npm run build` — builds successfully
- [ ] New UI code is accessible (ARIA roles, keyboard navigation, focus states)
- [ ] New server-side code does not expose secrets to the client
- [ ] New Supabase queries respect RLS (never use the service-role key for user data)
- [ ] Any new environment variables are added to `.env.example` with comments

---

## Project decisions to respect

- **Narrow scope** — SOPSmith does one job: rough notes in, SOP out. Resist feature creep.
- **No billing or teams** — out of scope for the current version
- **RLS for user data** — the app uses the public Supabase client + auth cookies, not a service-role key, for all user-facing reads and writes
- **Plain-text SOP output** — keeps generation simple, copyable, and easy to validate

---

## Questions

Open a GitHub Issue or Discussion if you are unsure whether a change is in scope before investing time in it.
