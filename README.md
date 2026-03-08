# Sifa Web

Frontend for Sifa, a professional identity network on the AT Protocol.

## Tech Stack

| Technology  | Version | Purpose                         |
| ----------- | ------- | ------------------------------- |
| Next.js     | 16      | React framework with App Router |
| React       | 19      | UI library                      |
| TypeScript  | 5.9     | Type-safe JavaScript            |
| TailwindCSS | 4       | Utility-first CSS               |
| Vitest      | 4       | Unit and component testing      |
| vitest-axe  | 1.x     | Accessibility testing           |

## Quick Start

### Prerequisites

- Node.js 25+
- npm 11+

### Setup

```bash
git clone https://github.com/singi-labs/sifa-web.git
cd sifa-web
npm ci
npm run dev
```

The development server starts at `http://localhost:3000`.

## Available Scripts

| Script         | Command                | Description               |
| -------------- | ---------------------- | ------------------------- |
| `dev`          | `npm run dev`          | Start development server  |
| `build`        | `npm run build`        | Production build          |
| `test`         | `npm test`             | Run all tests             |
| `lint`         | `npm run lint`         | Run ESLint                |
| `typecheck`    | `npm run typecheck`    | TypeScript type checking  |
| `format`       | `npm run format`       | Format code with Prettier |
| `format:check` | `npm run format:check` | Check formatting          |

## License

Source-available. See [LICENSE](LICENSE) for details. Lexicon schemas and import tools are MIT-licensed.

## Links

- [sifa.id](https://sifa.id)
- [Singi Labs](https://singi.dev)
