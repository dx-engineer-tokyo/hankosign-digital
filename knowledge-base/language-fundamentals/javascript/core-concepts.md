# JavaScript Core Concepts

## What It Is

JavaScript is the programming language that runs both in the browser and on the server (via Node.js) for this project. While HankoSign Digital is written in TypeScript, TypeScript compiles to JavaScript, so understanding JavaScript fundamentals is essential. The project targets ES2020 (as configured in `tsconfig.json`).

## Why It Matters Here

Every line of code in this project ultimately executes as JavaScript. TypeScript adds type annotations, but the runtime behavior - closures, prototype chain, `this` binding, event loop - is all JavaScript. Understanding these concepts helps debug runtime issues that TypeScript cannot catch at compile time.

## Variables and Declarations

### `const`, `let`, and `var`

This project exclusively uses `const` and `let` (never `var`). The rule: use `const` by default, `let` only when reassignment is needed.

```javascript
// const - cannot be reassigned (used for most declarations)
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'hankosign-documents';
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// let - can be reassigned (used sparingly)
let redisClient = null;       // reassigned when connection is established
let code = '';                 // built up in a loop

// const with objects/arrays - the binding is constant, not the contents
const config = { port: 3004 };
config.port = 3005;           // This is fine - mutating the object, not reassigning
```

**In this project:** See `lib/redis.ts:4` where `let` is used because the client starts as `null` and is assigned later. Compare with `lib/s3.ts:7` where `const` is used because the S3 client is created once.

### Template Literals

Used extensively for string interpolation, especially in S3 keys and email templates.

```javascript
// From lib/s3.ts - building S3 URLs
return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

// From lib/s3.ts - generating file keys
return `documents/${userId}/${timestamp}-${cleanFileName}`;

// From lib/utils.ts - Japanese era formatting
return `令和${reiwaYear === 1 ? '元' : reiwaYear}年`;
```

## Data Types

### Primitives
```javascript
// string
const email = 'user@example.com';

// number (no int vs float distinction in JS)
const size = 60;           // integer
const positionX = 450.5;   // floating point

// boolean
const isRegistered = false;
const isValid = true;

// null and undefined
let redisClient = null;    // explicit "no value"
// undefined is the default for unset variables/properties

// BigInt (not used in this project but available in ES2020)
```

### Reference Types
```javascript
// Objects
const user = { id: 'uuid', email: 'user@example.com', role: 'USER' };

// Arrays
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'image/jpeg',
  'image/png',
];

// Functions (first-class citizens)
const formatFileSize = (bytes) => { /* ... */ };
```

### Truthiness and Nullish Values

JavaScript has "truthy" and "falsy" values. This matters for conditional checks used throughout the project:

```javascript
// Falsy values: false, 0, '', null, undefined, NaN
// Everything else is truthy

// From lib/auth.ts - checking credentials exist
if (!credentials?.email || !credentials?.password) {
  throw new Error('メールアドレスとパスワードを入力してください');
}

// Nullish coalescing (??) - only checks null/undefined (not 0 or '')
const port = parseInt(process.env.SMTP_PORT ?? '587');

// Logical OR (||) - checks all falsy values
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'hankosign-documents';

// Optional chaining (?.) - safe property access
if (!session?.user) { ... }  // won't throw if session is null
```

## Functions

### Arrow Functions vs Regular Functions

This project uses arrow functions almost exclusively:

```javascript
// Arrow function (used throughout the project)
export const getRolePermissions = (role) => {
  // ...
};

// Arrow function with implicit return
const hasAdminAccess = (role) => role === 'ADMIN' || role === 'SUPER_ADMIN';

// Regular function (used for exports and named declarations)
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  // ...
}

// Regular function (used for React components)
export default function Alert({ variant, children, className = '' }) {
  // ...
}
```

**Key difference:** Arrow functions don't have their own `this` binding. In this project that rarely matters since class-based patterns aren't used, but it's why arrow functions work seamlessly as callbacks.

### Default Parameters

```javascript
// From lib/s3.ts
export async function getFileUrl(key, expiresIn = 3600) { ... }

// From components/HankoDesigner.tsx
export default function HankoDesigner({ onSave, initialText = '', size = 200 }) { ... }

// From lib/utils.ts
export function truncateText(text, maxLength) { ... }
```

### Rest and Spread Operators

```javascript
// Spread operator (...) - used extensively for object merging
// From lib/permissions.ts
case 'USER':
  return {
    ...basePermissions,       // spread base object
    canCreateHankos: true,    // override specific properties
    canUploadDocs: true,
  };

// From lib/s3.ts - conditional spread
const s3Client = new S3Client({
  region: REGION,
  credentials: { accessKeyId, secretAccessKey },
  ...(S3_ENDPOINT ? {         // conditionally add properties
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
  } : {}),
});

// From proxy.ts - array spread
config.externals = [...(config.externals || []), { canvas: 'canvas' }];
```

## Destructuring

### Object Destructuring

Used pervasively in this project for imports, function parameters, and assignments:

```javascript
// Import destructuring
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Function parameter destructuring (React components)
export default function Alert({ variant, children, className = '' }) { ... }

// Assignment destructuring
const { searchParams } = new URL(request.url);
const { locale } = await params;

// Nested destructuring
const { data: session } = useSession();  // rename 'data' to 'session'
```

### Array Destructuring

```javascript
// React hooks (useState returns [value, setter])
const [text, setText] = useState(initialText);
const [font, setFont] = useState('serif');
const [canvas, setCanvas] = useState(null);

// String splitting
const segments = pathname.split('/');

// IP address extraction
const ipAddress = (request.headers.get('x-forwarded-for') || 'unknown')
  .split(',')[0].trim();
```

## Closures

A closure is a function that retains access to variables from its enclosing scope even after that scope has finished executing.

```javascript
// From lib/prisma.ts - closure over globalForPrisma
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// The prisma instance "closes over" globalForPrisma, persisting across hot reloads

// From lib/redis.ts - closure over redisClient
let redisClient = null;

export async function getRedisClient() {
  if (!redisClient) {            // checks the closed-over variable
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }
  return redisClient;            // returns the closed-over variable
}
// Every call to getRedisClient() shares the same redisClient variable

// From components/HankoDesigner.tsx - useEffect cleanup closure
useEffect(() => {
  let isMounted = true;

  const initCanvas = async () => {
    if (!canvasRef.current) return;
    const mod = await import('fabric');
    if (!isMounted) return;       // closure reads isMounted
    // ... setup canvas
  };

  initCanvas();

  return () => {
    isMounted = false;            // cleanup modifies the closed-over variable
    if (canvasInstanceRef.current) {
      canvasInstanceRef.current.dispose();
    }
  };
}, [size]);
```

## Prototypes and `this`

While this project doesn't use class-based OOP patterns directly, understanding prototypes matters because:

1. **Built-in methods** like `Array.prototype.map`, `String.prototype.split` are used constantly
2. **Library objects** like Prisma Client and Fabric.js Canvas are class instances

```javascript
// Array prototype methods used in this project
const sizes = ['Bytes', 'KB', 'MB', 'GB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));

// String prototype methods
const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
const base64Data = validatedData.imageData.replace(/^data:image\/\w+;base64,/, '');

// from lib/utils.ts - using regex with String.prototype
code.match(/.{1,4}/g)?.join('-');

// Fabric.js uses classes internally
const circle = new fabric.Circle({ ... });  // creates a Circle instance
const hankoText = new fabric.Text(text, { ... });  // creates a Text instance
```

## Error Handling with try/catch

Every API route in this project uses try/catch for error handling:

```javascript
// Standard API route error pattern (from app/api/hankos/route.ts)
export async function POST(request) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const validatedData = hankoSchema.parse(body);

    // 3. Business logic
    const hanko = await prisma.hanko.create({ ... });

    // 4. Success response
    return NextResponse.json({ hanko }, { status: 201 });

  } catch (error) {
    // Zod validation errors get special handling
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    // Everything else is a 500
    console.error('Create hanko error:', error);
    return NextResponse.json({ error: 'Failed to create hanko' }, { status: 500 });
  }
}
```

## Iteration Methods

```javascript
// Array.map - transform each element (used in React JSX)
{FONT_OPTIONS.map((f) => (
  <option key={f.value} value={f.value}>
    {t(f.key)}
  </option>
))}

// Array.includes - check membership
const NON_SIGNABLE_STATUSES = ['COMPLETED', 'REJECTED', 'ARCHIVED'];
if (NON_SIGNABLE_STATUSES.includes(document.status)) { ... }

// Array.find - find first match
const admin = createdUsers.find(u => u.role === 'SUPER_ADMIN');

// for...of loop (used in seed.ts)
for (const userData of TEST_USERS) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({ data: { ... } });
}

// Record type iteration
const colors = { DRAFT: 'badge-ghost', PENDING: 'badge-warning', ... };
return colors[status] || 'badge-ghost';
```

## Key Files

- `tsconfig.json` - Sets `target: "ES2020"` defining available JS features
- `lib/utils.ts` - Pure utility functions demonstrating many JS patterns
- `lib/prisma.ts` - Singleton pattern using closures and globalThis
- `lib/redis.ts` - Lazy initialization pattern with closures
- `lib/s3.ts` - Conditional object spreading, template literals
- `components/HankoDesigner.tsx` - React hooks, closures, async dynamic imports

## Common Pitfalls

1. **`==` vs `===`**: Always use strict equality (`===`). This project follows this rule consistently.
2. **Mutating `const` objects**: `const` prevents reassignment, not mutation. A `const` object's properties can still change.
3. **`typeof null === 'object'`**: JavaScript quirk. Use `=== null` for null checks.
4. **Floating point arithmetic**: `0.1 + 0.2 !== 0.3`. Be cautious with financial calculations (this project stores amounts as integers in metadata).
5. **Array/Object reference equality**: `[] !== []` and `{} !== {}`. Two different objects are never equal by reference.

## Resources

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://javascript.info/) - Modern JavaScript tutorial
- [ES2020 Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference#ecmascript_2020)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
