# TypeScript Core Concepts

## What It Is

TypeScript is a superset of JavaScript that adds static type checking. Every `.ts` and `.tsx` file in this project is TypeScript. The compiler (via Next.js) checks types at build time and strips them away, producing plain JavaScript for the runtime.

## Why We Use It

1. **Catch bugs at compile time** instead of runtime (wrong property names, missing arguments, type mismatches)
2. **Prisma generates types** for all database models, giving type-safe queries
3. **IDE support** - autocompletion, refactoring, go-to-definition work reliably
4. **Self-documenting** - types serve as documentation for function signatures and data shapes

## TypeScript Configuration

The project uses strict mode (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "incremental": true,
    "paths": { "@/*": ["./*"] },
    "plugins": [{ "name": "next" }]
  }
}
```

Key settings:
- **`strict: true`** - Enables all strict type checking options (`strictNullChecks`, `noImplicitAny`, etc.)
- **`target: "ES2020"`** - Output JavaScript that uses ES2020 features (optional chaining, nullish coalescing)
- **`moduleResolution: "bundler"`** - Module resolution optimized for bundlers like webpack
- **`jsx: "react-jsx"`** - JSX transform without needing to import React in every file

## Type Annotations

### Basic Types

```typescript
// Primitive types
const email: string = 'user@example.com';
const size: number = 60;
const isRegistered: boolean = false;

// Union types
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

// Optional (with ?)
const nameKana: string | undefined;  // equivalent to optional

// Null vs undefined
let redisClient: ReturnType<typeof createClient> | null = null;
```

### Function Types

```typescript
// Parameter and return type annotations
export function formatJapaneseDate(date: Date): string {
  return format(date, 'yyyy年MM月dd日', { locale: ja });
}

// Async function (returns Promise<T>)
export async function getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({ ... }), { expiresIn });
}

// Function returning void
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ ... }));
}

// Arrow function types
export const hasAdminAccess = (role: UserRole): boolean => {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};
```

## Interfaces

Interfaces define the shape of objects. Used to describe API contracts, component props, and data structures.

```typescript
// From lib/email.ts - defining function parameter shape
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) { ... }

// From components/HankoDesigner.tsx - React component props
interface HankoDesignerProps {
  onSave: (imageData: string) => void;
  initialText?: string;   // ? makes it optional
  size?: number;
}

export default function HankoDesigner({ onSave, initialText = '', size = 200 }: HankoDesignerProps) { ... }

// From lib/permissions.ts - permission matrix
export interface Permission {
  canCreateHankos: boolean;
  canUploadDocs: boolean;
  canSignDocs: boolean;
  canApproveWorkflow: boolean;
  canManageRoles: boolean;
  canManageOrg: boolean;
  canViewReports: boolean;
  canAssignSuperAdmin: boolean;
  canManageSystem: boolean;
  canViewAuditLogs: boolean;
}
```

## Type Aliases

Type aliases create names for types. They can represent unions, intersections, primitives, and more.

```typescript
// Simple union alias
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

// Union of string literals (from components/Alert.tsx)
type AlertVariant = 'error' | 'success' | 'warning' | 'info';

// Record type - maps keys to values
const variantStyles: Record<AlertVariant, { container: string; icon: ReactNode }> = {
  error: {
    container: 'border-red-200 bg-red-50 text-red-700',
    icon: <XCircle className="h-5 w-5" />,
  },
  // ...
};

// Record for status-to-class mapping (lib/utils.ts)
const colors: Record<string, string> = {
  DRAFT: 'badge-ghost',
  PENDING: 'badge-warning',
  IN_PROGRESS: 'badge-info',
  // ...
};
```

### Interface vs Type Alias

Both can describe object shapes. This project uses interfaces for object shapes and types for unions:

```typescript
// Interface - for object shapes (can be extended)
interface Permission {
  canCreateHankos: boolean;
  canUploadDocs: boolean;
}

// Type alias - for unions and simple types
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
type AlertVariant = 'error' | 'success' | 'warning' | 'info';
```

## Generics

Generics allow writing functions and types that work with multiple types.

```typescript
// From lib/redis.ts - generic cache function
export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const value = await client.get(key);

  if (!value) return null;

  try {
    return JSON.parse(value) as T;   // cast parsed value to caller's type
  } catch {
    return null;
  }
}

// Usage:
const user = await getCache<User>('user:123');        // returns User | null
const count = await getCache<number>('counter:abc');   // returns number | null
```

```typescript
// React's built-in generics
const [text, setText] = useState<string>(initialText);    // state type is string
const [canvas, setCanvas] = useState<any>(null);          // state type is any
const canvasRef = useRef<HTMLCanvasElement>(null);         // ref to canvas element
```

## Type Assertions

Used when you know more about a type than TypeScript can infer.

```typescript
// From lib/prisma.ts - asserting globalThis shape
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
// globalThis doesn't have a 'prisma' property by default,
// so we assert it does with 'as unknown as'

// From lib/auth.ts - JWT callback return type
session.user.id = token.id as string;
session.user.role = token.role as string;

// From lib/permissions.ts - casting session user
const userRole = (session.user as any).role as UserRole;

// From app/api/documents/route.ts - FormData value
const file = formData.get('file') as File;
const title = formData.get('title') as string;
```

**Caution:** `as any` bypasses type checking entirely. It's used sparingly in this project, mainly where NextAuth.js types don't fully describe the extended session shape.

## Enums (via Prisma)

Prisma generates TypeScript enums from the database schema:

```prisma
// prisma/schema.prisma
enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

enum HankoType {
  MITOMEIN    // 認印
  GINKOIN     // 銀行印
  JITSUIN     // 実印
}

enum DocumentStatus {
  DRAFT
  PENDING
  IN_PROGRESS
  COMPLETED
  REJECTED
  ARCHIVED
}
```

These generate TypeScript types that can be imported:

```typescript
// From prisma/seed.ts
import { Role, HankoType, DocumentStatus, ApprovalStatus } from '@prisma/client';

const user = await prisma.user.create({
  data: {
    role: Role.SUPER_ADMIN,   // type-safe enum value
    // ...
  },
});
```

The project also uses string literal unions as a lighter-weight alternative:

```typescript
// From lib/permissions.ts
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
// Equivalent to the Prisma enum for type checking purposes
```

## Zod Schema + TypeScript

Zod provides runtime validation that also infers TypeScript types:

```typescript
import { z } from 'zod';

// Define runtime validation schema
const hankoSchema = z.object({
  name: z.string().min(1, 'Please enter a hanko name').max(50),
  type: z.enum(['MITOMEIN', 'GINKOIN', 'JITSUIN']),
  imageData: z.string().max(500_000),
  font: z.string().max(100).optional(),
  size: z.number().int().min(20).max(500).default(60),
});

// Infer TypeScript type from schema (optional but useful)
type HankoInput = z.infer<typeof hankoSchema>;
// Results in:
// {
//   name: string;
//   type: 'MITOMEIN' | 'GINKOIN' | 'JITSUIN';
//   imageData: string;
//   font?: string;
//   size: number;
// }

// Usage in API route
const body = await request.json();
const validatedData = hankoSchema.parse(body);
// validatedData is typed and validated
```

## Utility Types

TypeScript provides built-in utility types used in this project:

```typescript
// ReturnType<T> - extract return type of a function
let redisClient: ReturnType<typeof createClient> | null = null;

// Record<K, V> - object with keys K and values V
const colors: Record<string, string> = { DRAFT: 'badge-ghost', ... };
const variantStyles: Record<AlertVariant, { container: string; icon: ReactNode }>;

// Promise<T> - async function return type
async function getFileUrl(key: string): Promise<string> { ... }
async function deleteFile(key: string): Promise<void> { ... }
async function getCache<T>(key: string): Promise<T | null> { ... }

// Common utility types (available but not heavily used in this project):
// Partial<T>    - all properties optional
// Required<T>   - all properties required
// Pick<T, K>    - select specific properties
// Omit<T, K>    - exclude specific properties
// Readonly<T>   - all properties readonly
```

## `const` Assertions

```typescript
// From components/HankoDesigner.tsx
const FONT_OPTIONS = [
  { value: 'serif', key: 'fontSerif' },
  { value: 'sans-serif', key: 'fontSansSerif' },
  { value: 'cursive', key: 'fontCursive' },
  { value: 'monospace', key: 'fontMonospace' },
] as const;
// 'as const' makes the array and its elements readonly
// and preserves literal types instead of widening to string
```

## NextAuth Type Augmentation

NextAuth.js requires type augmentation to add custom properties to the session:

```typescript
// Types would be declared to extend the default session:
// This project uses 'as any' and 'as string' casts instead (lib/permissions.ts:100)
const userRole = (session.user as any).role as UserRole;

// A cleaner approach would be to declare module augmentation:
// declare module 'next-auth' {
//   interface User {
//     role: string;
//   }
//   interface Session {
//     user: { id: string; role: string } & DefaultSession['user'];
//   }
// }
```

## Key Files

- `tsconfig.json` - TypeScript compiler configuration
- `lib/permissions.ts` - Type aliases, interfaces, function type annotations
- `lib/redis.ts` - Generics in cache functions
- `lib/prisma.ts` - Type assertion with `as unknown as`
- `lib/auth.ts` - NextAuth types, session callbacks with type casts
- `components/Alert.tsx` - Union types, Record type, ReactNode
- `components/HankoDesigner.tsx` - `as const`, useRef generics, interface props
- `prisma/schema.prisma` - Source of generated TypeScript enums and types

## Common Pitfalls

1. **Overusing `any`**: Defeats the purpose of TypeScript. Use `unknown` when the type is truly unknown, then narrow it.
2. **Not using strict mode**: The project has `strict: true` - keep it that way. Turning it off hides real bugs.
3. **Ignoring Prisma-generated types**: Prisma generates perfect types for all models. Use them instead of manually defining interfaces.
4. **Type assertions vs type guards**: `as string` is an assertion (trust me). A type guard (`typeof x === 'string'`) is a check (prove it). Prefer guards when possible.
5. **Forgetting `Promise<T>` return types**: Async functions return `Promise<T>`, not `T`. TypeScript infers this, but explicit annotations improve readability.

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Prisma: Generated Types](https://www.prisma.io/docs/orm/prisma-client/type-safety)
- [Zod: TypeScript-first Schema Validation](https://zod.dev/)
- [Total TypeScript (Matt Pocock)](https://www.totaltypescript.com/)
