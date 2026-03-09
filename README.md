<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/singi-labs/.github/main/assets/sifa-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/singi-labs/.github/main/assets/sifa-logo-light.svg">
  <img alt="Sifa Logo" src="https://raw.githubusercontent.com/singi-labs/.github/main/assets/sifa-logo-dark.svg" width="120">
</picture>

# Sifa Web

**Frontend for the Sifa professional network -- portable profiles, verifiable track records, accessible by default.**

[![Status: Alpha](https://img.shields.io/badge/status-alpha-orange)]()
[![License: Source Available](https://img.shields.io/badge/License-Source--Available-blue)]()
[![CI](https://github.com/singi-labs/sifa-web/actions/workflows/ci.yml/badge.svg)](https://github.com/singi-labs/sifa-web/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-25%20LTS-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org/)

</div>

---

## Overview

The frontend for the Sifa professional network. Renders professional profiles, endorsement workflows, professional graph navigation, and career timelines. Communicates with the [sifa-api](https://github.com/singi-labs/sifa-api) backend via REST API. Supports six languages out of the box.

---

## Tech Stack

| Component     | Technology                                            |
| ------------- | ----------------------------------------------------- |
| Framework     | Next.js 16 / React 19 / TypeScript (strict)          |
| Styling       | TailwindCSS                                           |
| Components    | shadcn/ui (Radix primitives)                          |
| Colors        | Radix Colors (12-step system) + Flexoki (accent hues) |
| Icons         | Phosphor Icons                                        |
| i18n          | next-intl (en, nl, de, fr, es, pt)                    |
| Testing       | Vitest + vitest-axe                                   |
| Accessibility | WCAG 2.2 AA                                           |

---

## Quick Start

**Prerequisites:** Node.js 25+, npm, [sifa-api](https://github.com/singi-labs/sifa-api) running.

```bash
git clone https://github.com/singi-labs/sifa-web.git
cd sifa-web
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view in the browser.

---

## Development

```bash
npm test           # Run all tests
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript strict mode
npm run format     # Format with Prettier
```

See [CONTRIBUTING.md](https://github.com/singi-labs/.github/blob/main/CONTRIBUTING.md) for branching strategy, commit format, and code review process.

**Key standards:**

- TypeScript strict mode (no `any`, no `@ts-ignore`)
- WCAG 2.2 AA accessibility
- Conventional commits enforced

---

## Related Repositories

| Repository                                                       | Description                              | License          |
| ---------------------------------------------------------------- | ---------------------------------------- | ---------------- |
| [sifa-api](https://github.com/singi-labs/sifa-api)             | AppView backend (Fastify, AT Protocol)   | Source-available |
| [sifa-lexicons](https://github.com/singi-labs/sifa-lexicons)   | AT Protocol professional profile schemas | MIT              |
| [sifa-deploy](https://github.com/singi-labs/sifa-deploy)       | Docker Compose + Caddy deployment config | Source-available |
| [sifa-workspace](https://github.com/singi-labs/sifa-workspace) | Project coordination and issue tracking  | Source-available |

---

## Community

- **Website:** [sifa.id](https://sifa.id)
- **Discussions:** [GitHub Discussions](https://github.com/orgs/singi-labs/discussions)
- **Issues:** [Report bugs](https://github.com/singi-labs/sifa-web/issues)

---

## License

**Source-available** -- Public repository, proprietary license. Lexicon schemas and import tools are MIT-licensed.

See [LICENSE](LICENSE) for full terms.

---

(c) 2026 Singi Labs
