# JavaScript Modules & Scope

## What It Is

Modules are JavaScript's system for organizing code into separate files that can import and export values. Scope determines where variables and functions are accessible. Together they control code organization and encapsulation in this project.

## Why It Matters Here

HankoSign Digital uses two module systems:
- **ES Modules (ESM)** - Used in all application code (`.ts`/`.tsx` files). Configured via `"module": "esnext"` in `tsconfig.json`.
- **CommonJS (CJS)** - Used in configuration files (`next.config.js`, `tailwind.config.js`, `postcss.config.js`) because these run directly in Node.js without transpilation.

Understanding the difference prevents common errors when working with config files vs application code.

## ES Modules (ESM)

### Named Exports and Imports

The most common pattern in this project. Multiple values can be exported from a single file.

```javascript
// ── Exporting (lib/s3.ts) ──
export async function uploadFile(key, body, contentType) { ... }
export async function getFileUrl(key, expiresIn = 3600) { ... }
export async function deleteFile(key) { ... }
export function generateFileKey(userId, fileName) { ... }
export function generateHankoKey(userId, hankoId) { ... }

// ── Importing (app/api/hankos/route.ts) ──
import { uploadFile, generateHankoKey } from '@/lib/s3';

// ── Importing (app/api/documents/route.ts) ──
import { uploadFile, generateFileKey } from '@/lib/s3';
```

```javascript
// ── Exporting (lib/permissions.ts) ──
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export interface Permission { ... }
export const getRolePermissions = (role) => { ... };
export const hasAdminAccess = (role) => { ... };
export const hasSuperAdminAccess = (role) => { ... };
export async function requireAuth() { ... }
export async function requireAdmin() { ... }
export async function requireSuperAdmin() { ... }

// ── Importing only what's needed ──
import { requireAuth } from '@/lib/permissions';
```

### Default Exports

Used for the primary export of a file. Each file can have only one default export.

```javascript
// ── Default export (lib/prisma.ts) ──
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... });
export default prisma;  // also available as default

// ── Importing default ──
import prisma from '@/lib/prisma';

// ── Default export (components/Alert.tsx) ──
export default function Alert({ variant, children, className = '' }) { ... }

// ── Importing default ──
import Alert from '@/components/Alert';
```

### Mixed Exports

A file can have both named and default exports:

```javascript
// lib/prisma.ts exports both
export const prisma = ...;   // named export
export default prisma;       // default export (same value)

// lib/auth.ts exports only named
export const authOptions: NextAuthOptions = { ... };  // named only, no default
```

### Re-exports

The i18n navigation module re-exports from a library:

```javascript
// i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Destructure and re-export in one step
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

### Dynamic Imports

`import()` as a function (not a statement) loads modules at runtime, returning a Promise:

```javascript
// From components/HankoDesigner.tsx - lazy-load Fabric.js
const mod = await import('fabric');

// From i18n/request.ts - load locale-specific translations
messages: (await import(`../messages/${locale}.json`)).default,
```

## CommonJS (CJS)

Used only in Node.js configuration files.

```javascript
// next.config.js - CommonJS
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = { ... };
module.exports = withNextIntl(nextConfig);

// tailwind.config.js - CommonJS
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', ...],
  plugins: [require('daisyui')],
  ...
};

// postcss.config.js - CommonJS
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Why Config Files Use CommonJS

These files are read directly by build tools (Next.js, Tailwind, PostCSS) that run in Node.js before any TypeScript compilation. While newer versions of Node.js support ESM, CommonJS is still the default for `.js` config files and avoids compatibility issues.

## Path Aliases

The project configures a path alias in `tsconfig.json` to avoid deep relative imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This means:
```javascript
// Instead of this (fragile, hard to read):
import prisma from '../../../lib/prisma';

// You write this (clean, absolute from project root):
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import Alert from '@/components/Alert';
import { routing } from '@/i18n/routing';
```

## Scope

### Block Scope (`const` and `let`)

Variables declared with `const` and `let` are block-scoped - they exist only within their enclosing `{ }`:

```javascript
// From lib/utils.ts
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;                          // scoped to function
  const sizes = ['Bytes', 'KB', 'MB', 'GB']; // scoped to function
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
// k, sizes, i are not accessible outside this function
```

### Module Scope

Variables declared at the top level of a module are scoped to that module - they're not global.

```javascript
// lib/s3.ts - module-scoped variables
const S3_ENDPOINT = process.env.S3_ENDPOINT || '';         // module scope
const REGION = process.env.AWS_REGION || 'ap-northeast-1'; // module scope
const s3Client = new S3Client({ ... });                     // module scope
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '...'; // module scope

// These are only accessible within this file
// Other files must import the exported functions to use them
```

```javascript
// lib/redis.ts - module-scoped mutable variable
let redisClient = null;  // private to this module

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ ... });
    await redisClient.connect();
  }
  return redisClient;
}
// redisClient cannot be accessed from outside - only through getRedisClient()
```

### Global Scope (globalThis)

Used sparingly. The Prisma singleton uses `globalThis` to persist across hot module reloading in development:

```javascript
// lib/prisma.ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ ... });

// Attach to globalThis to survive hot reloading in dev
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why globalThis here?** In development, Next.js hot reloading re-executes module code, which would create new Prisma connections each time. By storing the client on `globalThis`, it persists across reloads.

### Closure Scope

Functions "close over" their enclosing scope's variables. See [Core Concepts - Closures](./core-concepts.md#closures) for detailed examples from this project.

## Module Organization in This Project

### By Feature vs By Layer

The project uses a mix:

```
# By layer (utilities shared across features)
lib/
  auth.ts          # auth layer
  prisma.ts        # database layer
  s3.ts            # storage layer
  redis.ts         # cache layer
  email.ts         # communication layer
  permissions.ts   # authorization layer
  utils.ts         # shared utilities

# By feature (self-contained feature modules)
app/api/
  hankos/route.ts      # hanko feature
  documents/route.ts   # document feature
  signatures/route.ts  # signature feature

# Components (shared UI)
components/
  HankoDesigner.tsx    # hanko creation UI
  Alert.tsx            # reusable alert
  AuthProvider.tsx     # auth context
```

### Import Conventions

```javascript
// 1. External packages first
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// 2. Internal modules (using @ alias)
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFile, generateHankoKey } from '@/lib/s3';
```

## Key Files

- `tsconfig.json` - Module resolution and path alias configuration
- `next.config.js` - CommonJS config, Next.js plugin wrapping
- `tailwind.config.js` - CommonJS config with plugin requires
- `lib/prisma.ts` - globalThis for dev singleton, default + named export
- `i18n/navigation.ts` - Re-export pattern with destructuring
- `i18n/request.ts` - Dynamic import for locale messages

## Common Pitfalls

1. **Mixing ESM and CJS syntax**: Don't use `require()` in `.ts` files or `import` in `.js` config files (without ESM setup).

2. **Circular imports**: If module A imports from B and B imports from A, you may get `undefined` values. The project avoids this by keeping `lib/` modules independent.

3. **Missing file extensions**: In TypeScript/Next.js, you omit file extensions in imports (`import from '@/lib/prisma'` not `'@/lib/prisma.ts'`). The bundler resolves them.

4. **Default import naming**: Default imports can be named anything, which can cause confusion.
   ```javascript
   // These all import the same default export
   import prisma from '@/lib/prisma';
   import db from '@/lib/prisma';       // works but inconsistent
   import database from '@/lib/prisma'; // works but confusing
   ```

5. **Side effects in module scope**: Module-scoped code runs when the module is first imported. The S3 client (`lib/s3.ts`) and email transporter (`lib/email.ts`) are created at import time, which means environment variables must be set before import.

## Resources

- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [JavaScript.info: Modules](https://javascript.info/modules-intro)
