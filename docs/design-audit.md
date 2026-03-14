# SOPSmith Design Audit

## Scope

This audit covers the existing frontend surfaces for:

- landing page
- login page
- SOP library
- new SOP page
- SOP detail page

It also documents the design tokens and UI primitives added in this Phase 1 pass.

## Important Note

The referenced `design-ux-architect.md` file was not present in the repository during this pass. The design system below was derived from the current product direction, the existing dark minimal UI, and the implementation requirements in this task.

## Before: Current UI Audit

### Shared Patterns Found

- Repeated page-local shells using `max-w-6xl`, `px-6`, `py-6`, and ad hoc grid values
- Repeated custom card treatments through `surface-card` and `muted-panel`
- Repeated button styling through `primary-button` and `secondary-button`
- Repeated heading sizing with direct `text-4xl`, `text-5xl`, and `sm:text-6xl` utilities
- Good visual consistency overall, but most layout decisions were duplicated instead of centralized

### Colors

Before this pass, the frontend relied on a dark-only token set defined in `app/globals.css`:

- background: `#091018`
- foreground: `#eff4fb`
- muted: `#9aa7b8`
- accent: amber
- multiple page-level uses of `white/4`, `white/8`, and `white/10`

Issues:

- tokens were not semantic enough for future expansion
- light theme was not supported
- several components used hard-coded translucent whites instead of shared semantic surfaces

### Typography

Before this pass:

- strong overall hierarchy
- repeated direct sizing utilities instead of named scale tokens
- headings felt consistent visually, but the scale was not encoded as a reusable system

Issues:

- typography choices were page-specific
- labels, meta text, and display sizes were not centralized

### Spacing

Before this pass:

- spacing felt reasonably polished
- `px-5`, `px-6`, `py-5`, `py-6`, `gap-4`, `gap-6`, and `gap-8` were used repeatedly

Issues:

- spacing rhythm was consistent by feel, not by component API
- page shells, cards, and grids repeated the same spacing patterns instead of inheriting them from base primitives

### Responsiveness

Before this pass:

- landing and dashboard layouts already adapted to mobile reasonably well
- cards stacked cleanly on small screens
- dashboard header switched from vertical to horizontal at larger breakpoints

Issues:

- breakpoints were implicit and page-local
- no custom breakpoint vocabulary for future expansion
- login and landing headers used slightly different responsive composition rules

### Accessibility Issues Found

- navigation landmarks were missing explicit `aria-label`s in some places
- form containers did not consistently expose `aria-busy`, `role="alert"`, or `role="status"`
- clickable SOP cards were keyboard accessible through `Link`, but they lacked explicit descriptive labels
- FAQ content used static cards instead of accordion semantics
- theme preference handling was absent
- focus treatment depended mainly on browser defaults outside of inputs

## Phase 1 Changes Made

### New Design Tokens

Added semantic tokens in `styles/design-system.css` for both light and dark themes:

- `--background`
- `--foreground`
- `--muted`
- `--muted-foreground`
- `--surface`
- `--surface-strong`
- `--surface-muted`
- `--border`
- `--accent`
- `--accent-foreground`
- `--success`
- `--danger`
- `--ring`
- `--shadow-soft`
- `--shadow-panel`
- `--radius-shell`
- `--radius-panel`

Theme behavior:

- defaults to system preference via `prefers-color-scheme`
- supports explicit override through `data-theme`
- keeps the existing dark style as a first-class theme instead of replacing it

### Tailwind Theme Extensions

Added `tailwind.config.js` with:

- semantic color names
- typography scale:
  - `display`
  - `h1`
  - `h2`
  - `h3`
  - `body`
  - `label`
  - `meta`
- spacing additions:
  - `18`
  - `22`
  - `26`
  - `30`
  - `34`
- custom breakpoints:
  - `xs`
  - `3xl`

### New Base UI Components

Added reusable UI primitives in `components/ui/`:

- `Container`
- `Grid`
- `Button`
- `Card`
- `Accordion`
- `ThemeToggle`

Supporting utilities:

- `hooks/useTheme.ts`
- `lib/cn.ts`

### Accessible UI Improvements

- added explicit nav labels
- added descriptive labels for clickable SOP cards
- added `aria-busy` to the create form fieldset while generation is pending
- added `role="status"` and `role="alert"` to user-facing feedback blocks
- replaced static FAQ cards with semantic accordion interactions
- improved focus visibility across links, buttons, inputs, textareas, and summaries

## After: Frontend System Summary

### Components By Page

#### Landing

- `Container`
- `Grid`
- `Card`
- `Accordion`
- `ThemeToggle`

#### Login

- `Container`
- `Grid`
- `Card`
- `ThemeToggle`
- existing `LoginForm`

#### Library

- shared dashboard header with `ThemeToggle`
- `Card`
- `Grid`
- shared button variants

#### New SOP

- shared dashboard header with `ThemeToggle`
- `Card`
- `Grid`
- existing `CreateSopForm`

#### SOP Detail

- shared dashboard header with `ThemeToggle`
- `Card`
- `Accordion`
- existing `CopyButton`

## Files Added Or Updated In Phase 1

- `tailwind.config.js`
- `styles/design-system.css`
- `docs/design-audit.md`
- `hooks/useTheme.ts`
- `lib/cn.ts`
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Container.tsx`
- `components/ui/Grid.tsx`
- `components/ui/Accordion.tsx`
- `components/ui/ThemeToggle.tsx`
- existing page and component files updated to adopt the new system

## Screenshots

Before/after screenshots were not captured in this repository pass. If needed, capture the following after this Phase 1 branch is running locally:

- landing page, dark theme
- landing page, light theme
- login page with both auth options visible
- SOP library with saved cards
- new SOP page while the form is idle
- new SOP page while generation is in progress
- SOP detail page with original notes expanded
