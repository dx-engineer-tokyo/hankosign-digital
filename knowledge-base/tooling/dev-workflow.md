# Development Workflow

## What It Is

This document covers the development tools, scripts, and workflows used to build and maintain HankoSign Digital.

## Development Environment

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (included with Node.js)
- **Docker** and **Docker Compose** (for PostgreSQL, Redis, MinIO)
- **Git** for version control

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Start infrastructure services
docker compose -f ../../docker-compose.yml up -d    # PostgreSQL + Redis
docker compose up -d                                  # MinIO

# 4. Initialize database
npm run db:migrate     # Apply migrations
npm run db:seed        # Load demo data

# 5. Start dev server
npm run dev            # http://localhost:3004
```

### NPM Scripts

```bash
npm run dev          # Start development server (port 3004, hot reload)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint check
npm run db:migrate   # Prisma migrations (interactive)
npm run db:generate  # Regenerate Prisma client types
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed demo data
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,           // all strict checks enabled
    "jsx": "react-jsx",
    "incremental": true,      // faster subsequent builds
    "paths": { "@/*": ["./*"] }  // import alias
  }
}
```

### ESLint

```json
// .eslintrc.json
{
  "extends": "next/core-web-vitals"
}
```

Enforces:
- Next.js best practices (Image component, Link component, etc.)
- React hooks rules
- Web Vitals performance guidelines

Run: `npm run lint`

### Prisma Studio

Visual database browser:

```bash
npm run db:studio
# Opens at http://localhost:5555
```

Allows browsing and editing data in all tables without writing SQL.

### Path Aliases

The `@/` alias maps to the project root:

```typescript
// Instead of relative paths:
import prisma from '../../../lib/prisma';

// Use the alias:
import prisma from '@/lib/prisma';
```

Configured in `tsconfig.json` and automatically understood by Next.js.

## Database Workflow

### Creating a Migration

When you change `prisma/schema.prisma`:

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate migration
npm run db:migrate
# Prisma prompts for a migration name
# Creates SQL in prisma/migrations/

# 3. Regenerate client (if not done automatically)
npm run db:generate
```

### Resetting the Database

```bash
# Reset database and re-seed
npx prisma migrate reset
# This drops all tables, re-applies migrations, and runs seed
```

### Viewing the Database

```bash
# Option 1: Prisma Studio
npm run db:studio

# Option 2: Direct PostgreSQL connection
psql $DATABASE_URL
```

## Hot Reload Behavior

Next.js development server (`npm run dev`) provides:
- **Fast Refresh**: React component changes update instantly without full page reload
- **API route hot reload**: Changes to API routes take effect immediately
- **CSS hot reload**: Tailwind class changes apply without page reload
- **TypeScript errors**: Shown in the browser as an overlay

### Singleton Preservation

In development, Next.js re-executes modules on each change. The Prisma and Redis singletons use `globalThis` to prevent creating new connections on every reload (see `lib/prisma.ts`).

## Debugging

### Server-Side Logging

API routes use `console.error` for error logging:
```typescript
console.error('Create hanko error:', error);
```

Prisma logs queries in development:
```typescript
new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

### Client-Side

- React DevTools for component inspection
- Browser Network tab for API request/response debugging
- NextAuth.js debug mode (add `debug: true` to auth config)

## Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| Next.js | 3004 | Application |
| MinIO API | 9000 | S3-compatible API |
| MinIO Console | 9001 | Web management UI |
| PostgreSQL | 5432 | Database |
| Redis | 6379/6380 | Cache |
| Prisma Studio | 5555 | Database GUI |

## Key Files

- `package.json` - Scripts, dependencies, Prisma seed config
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - Linting rules
- `.env.example` - Environment variable template
- `docker-compose.yml` - Development services

## Best Practices

1. **Run lint before committing**: `npm run lint` catches common issues
2. **Use Prisma Studio** for data inspection instead of raw SQL
3. **Check TypeScript errors** in the build: `npm run build`
4. **Seed after resetting**: Always run `npm run db:seed` after database resets

## Resources

- [Next.js Development Guide](https://nextjs.org/docs/getting-started/project-structure)
- [Prisma Studio](https://www.prisma.io/studio)
- [ESLint for Next.js](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
