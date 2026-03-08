# Sifa Web -- Frontend

<!-- Auto-generated from sifa-workspace. To propose changes, edit the source:
     https://github.com/singi-labs/sifa-workspace -->

Source-available | Part of [github.com/singi-labs](https://github.com/singi-labs)

The frontend for Sifa -- a decentralized professional identity and career network on the AT Protocol. Renders three surfaces: professional profiles (SEO-indexed), professional timeline, and ATmosphere stream (cross-app activity).

## Tech Stack

| Component       | Technology                                      |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 15+ / React 19 / TypeScript (strict)    |
| Styling         | TailwindCSS                                     |
| Components      | shadcn/ui + Radix primitives                    |
| Icons           | Phosphor Icons                                  |
| Colors          | Radix Colors (structural) + Flexoki accent hues |
| Testing         | Vitest + vitest-axe + @axe-core/playwright      |
| LinkedIn import | JSZip + Papa Parse (client-side only)           |
| SEO             | next-sitemap, JSON-LD (Schema.org Person)       |

## What This Repo Does

- Renders public professional profile pages (SSG/ISR, SEO-indexed, shareable URLs)
- Profile editing UI (positions, skills, education, certifications, endorsements)
- LinkedIn data import wizard (client-side ZIP parsing -- raw CSV never leaves the browser)
- Professional timeline (Barazo posts scoped to Sifa's community DID)
- ATmosphere stream (cross-app AT Protocol activity aggregation)
- Search interface (profiles by name, skills, location, company)
- AT Protocol OAuth login flow
- Endorsement management (mutual confirmation UI)

## Frontend-Specific Standards

- **Server Components first** -- RSC is the default. Client Components are exceptions with `"use client"` + justification comment.
- **No inline styles** -- all styling via Tailwind utility classes.
- **Small components** -- split at ~150 lines, keep composable.
- **Error boundaries** -- wrap all network-dependent UI.
- **Accessibility** -- WCAG 2.2 AA. eslint-plugin-jsx-a11y strict + vitest-axe + @axe-core/playwright.
- **SEO** -- JSON-LD Person schema, OpenGraph + Twitter Cards, sitemaps, canonical URLs.
- **Mobile-first** -- build at 375px first, scale up.
- **AT Protocol service layer** -- never call `@atproto/api` directly from components.
- **LinkedIn import privacy** -- all CSV parsing happens in the browser. No raw LinkedIn data touches the server.

---

## Project-Wide Standards

### About Sifa

Decentralized professional identity and career network built on the [AT Protocol](https://atproto.com/). Portable profiles, verifiable track record from real community contributions, no vendor lock-in.

- **Organization:** [github.com/singi-labs](https://github.com/singi-labs)
- **License:** Source-available (sifa-api, sifa-web) / MIT (sifa-lexicons)

### Coding Standards

1. **Test-Driven Development** -- write tests before implementation (Vitest).
2. **Strict TypeScript** -- `strict: true`, no `any`, no `@ts-ignore`.
3. **Conventional commits** -- `type(scope): description`.
4. **CI must pass** -- lint, typecheck, tests, security scan on every PR.
5. **Input validation** -- Zod schemas on all API inputs.
6. **Output sanitization** -- DOMPurify on all user-generated content.
7. **Structured logging** -- Pino logger, never `console.log`.
8. **Pin exact versions** -- no `^` or `~` in package.json.
9. **Named exports** -- prefer named exports over default exports.

### Git Workflow

All changes go through Pull Requests -- never commit directly to `main`. Branch naming: `type/short-description` (e.g., `feat/profile-editor`, `fix/import-wizard`).

### AT Protocol Context

- Users own their data (stored on their Personal Data Server)
- Lexicons (`id.sifa.*`) define the professional profile data schema
- Identity is portable via DIDs -- no vendor lock-in
- Sifa reuses `forum.barazo.*` lexicons for timeline posts and `community.lexicon.*` for location/calendar
