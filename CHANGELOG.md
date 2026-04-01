# Changelog

All notable changes to SOPSmith are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Multi-format copy button on SOP detail page — copy as Markdown, Plain Text, or Notion-ready format
- Keyboard shortcut `Cmd+Enter` / `Ctrl+Enter` to submit the SOP generation form instantly
- CSS confetti celebration animation fires on the detail page when arriving from a fresh SOP creation
- Exponential backoff retry logic in the Groq client (up to 3 retries, jittered, for 429/5xx errors)
- LRU-style in-process generation cache to skip redundant Groq calls for identical title + notes inputs
- MIT `LICENSE` file
- `/docs` folder with full setup guide, architecture overview, and contribution guide
- `CHANGELOG.md` (this file)

### Changed
- Upgraded runtime environment validation from manual checks to Zod schemas for fail-fast, structured error messages
- README.md fully rewritten: marketing-first hero section, feature/tech stack tables, one-click Vercel deploy button, corrected relative GitHub links (removed all broken Windows paths)

### Fixed
- All 8 pre-existing ESLint errors across 8 files:
  - Removed unused imports (`Link`, `createSopSchema`, `SiteFooter`, `SiteHeader`, `Card`, `Container`, `Grid`, `FileTypeIcon`)
  - Removed unused `messyNotesExample` variable in `create-sop-form.tsx`
  - Removed unused `node` destructured params in `sop-content.tsx` ReactMarkdown components
  - Replaced `props: any` with properly typed destructured signature in `sop-content.tsx`
  - Added `eslint-disable` comment for the `react-hooks/set-state-in-effect` false positive in `ThemeToggle.tsx`
  - Added `eslint-disable` comment for `@typescript-eslint/no-require-imports` in legacy `convert_html_to_jsx.js`
  - Suppressed false-positive `@next/next/no-page-custom-font` warning in root `layout.tsx` (App Router context)

---

## [0.1.0] — Initial Release

### Added
- Landing page with hero, three-step explainer, and CTA
- Email magic link authentication via Supabase
- Google OAuth authentication via Supabase
- Auth callback handler at `/auth/callback`
- Protected dashboard routes (`/dashboard`, `/dashboard/new`, `/dashboard/[id]`)
- Middleware-layer and server-component-layer route protection (defence in depth)
- SOP library page with search and empty state
- New SOP form with title, notes, and optional file attachments (PDF, DOC, DOCX, TXT)
- Groq-powered SOP generation with structured prompt and auto-repair validation pass
- SOP detail view with full section rendering, original notes accordion, and attachments
- Copy SOP to clipboard
- Download SOP as TXT
- Print-to-PDF via a generated print-ready HTML page
- Regenerate SOP from original notes (with confirmation)
- Delete SOP (with confirmation)
- Supabase Postgres persistence with row-level security
- Supabase Storage for file attachments with signed-URL downloads
- Light / dark mode with system-default detection
- PWA manifest and favicon
- Loading skeletons for dashboard, new SOP, and detail pages
- Error boundaries (`global-error.tsx`, `app/dashboard/error.tsx`) with recovery actions
- Not-found pages for app root and SOP detail
- Toast notification system (custom implementation)
- Accessible ARIA roles, keyboard navigation, and focus states throughout
- Zod validation for all user inputs and environment variables
- Tailwind CSS v4 design system with glassmorphism, custom tokens, and responsive layout
