# JavaScript Async Patterns

## What It Is

Asynchronous programming allows JavaScript to perform non-blocking operations - database queries, file uploads, network requests - without freezing the application. This is fundamental to HankoSign Digital since nearly every operation involves async work: Prisma database queries, S3 file uploads, email sending, and Redis caching.

## Why It Matters Here

HankoSign Digital is a server-side Next.js application. Every API route handler deals with async operations:
- **Database queries** via Prisma (all return Promises)
- **File uploads** to S3 (network I/O)
- **Email sending** via Nodemailer (SMTP connection)
- **Redis caching** (network I/O)
- **Password hashing** with bcryptjs (CPU-intensive, wrapped in Promise)

Without understanding async patterns, you cannot write or debug any API route in this project.

## The Event Loop (Simplified)

JavaScript is single-threaded. The event loop manages async operations:

```
┌───────────────────────────┐
│        Call Stack          │  ← Executes synchronous code
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│      Web APIs / Node      │  ← Handles async operations
│   (setTimeout, fetch,     │     (database, network, etc.)
│    fs, crypto, etc.)      │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     Microtask Queue       │  ← Promise callbacks (.then)
│     (higher priority)     │     run BEFORE macrotasks
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     Macrotask Queue       │  ← setTimeout, setInterval
│     (lower priority)      │     callbacks
└───────────────────────────┘
```

Key insight: `await` pauses only the current async function, not the entire thread. Other requests can still be processed.

## Promises

A Promise represents a value that may not be available yet. It can be in one of three states: **pending**, **fulfilled**, or **rejected**.

```javascript
// Creating a Promise (rarely needed - most libraries return them)
const myPromise = new Promise((resolve, reject) => {
  // async work here
  if (success) resolve(value);
  else reject(error);
});

// Consuming a Promise with .then/.catch
myPromise
  .then(value => console.log(value))
  .catch(error => console.error(error));
```

In this project, Promises are consumed almost exclusively with `async/await` rather than `.then()` chains.

## async/await

`async/await` is syntactic sugar over Promises that makes async code read like synchronous code. This is the primary async pattern used throughout HankoSign Digital.

### Basic Pattern

```javascript
// Every API route handler is an async function
export async function POST(request: NextRequest) {
  // await pauses until the Promise resolves
  const session = await getServerSession(authOptions);

  // Each await is sequential - waits for the previous to complete
  const body = await request.json();
  const validatedData = hankoSchema.parse(body);

  const hanko = await prisma.hanko.create({ data: { ... } });

  return NextResponse.json({ hanko }, { status: 201 });
}
```

### Sequential vs Parallel Execution

```javascript
// SEQUENTIAL - each await waits for the previous (slower)
// Used when operations depend on each other
const user = await prisma.user.findUnique({ where: { email } });
const isValid = await compare(password, user.password);  // needs user first

// PARALLEL - start all at once, await all together (faster)
// Used when operations are independent
// Example: if you needed to fetch user and their settings simultaneously
const [user, settings] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.userSettings.findUnique({ where: { userId: id } }),
]);
```

### Real Examples from This Project

**Database queries (lib/auth.ts):**
```javascript
async authorize(credentials) {
  // Sequential: must find user before comparing password
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user) {
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }

  const isPasswordValid = await compare(credentials.password, user.password);

  if (!isPasswordValid) {
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
```

**File upload (app/api/documents/route.ts):**
```javascript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);      // async: checks JWT
  const formData = await request.formData();                 // async: reads request body
  const bytes = await file.arrayBuffer();                    // async: reads file bytes
  const fileUrl = await uploadFile(s3Key, buffer, file.type); // async: uploads to S3
  const document = await prisma.document.create({ ... });    // async: inserts into DB
  return NextResponse.json({ document }, { status: 201 });
}
```

**Redis caching (lib/redis.ts):**
```javascript
export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();     // async: may need to connect
  const value = await client.get(key);       // async: network call to Redis

  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
```

**Email sending (lib/email.ts):**
```javascript
export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({             // async: SMTP network call
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
```

## Error Handling in Async Code

### try/catch with async/await

This is the standard pattern used in every API route:

```javascript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const hankos = await prisma.hanko.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ hankos });
  } catch (error) {
    console.error('Get hankos error:', error);
    return NextResponse.json({ error: 'Failed to retrieve hankos' }, { status: 500 });
  }
}
```

### Catching Specific Error Types

```javascript
catch (error) {
  // Check for Zod validation errors specifically
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 }
    );
  }

  // Everything else is an internal server error
  console.error('Create hanko error:', error);
  return NextResponse.json({ error: 'Failed to create hanko' }, { status: 500 });
}
```

### Graceful Error Handling (non-throwing)

The email service returns success/failure instead of throwing:

```javascript
// From lib/email.ts - returns result object instead of throwing
export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({ ... });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };  // caller can check without try/catch
  }
}
```

## Dynamic Imports (Code Splitting)

`import()` returns a Promise, enabling lazy loading of heavy modules:

```javascript
// From components/HankoDesigner.tsx - dynamic import of Fabric.js
// Fabric.js is large and only needed on the client, so it's loaded dynamically
const initCanvas = async () => {
  if (!canvasRef.current) return;
  const mod = await import('fabric');     // dynamic import returns a Promise
  if (!isMounted) return;                 // check if component still mounted
  fabricRef.current = mod;
  const fabricCanvas = new mod.Canvas(canvasRef.current, { ... });
};

// From i18n/request.ts - dynamic import of translation files
return {
  locale,
  messages: (await import(`../messages/${locale}.json`)).default,
};
```

## Async Patterns in React (useEffect)

React's `useEffect` cannot directly be an async function, but you can define an async function inside it:

```javascript
// From components/HankoDesigner.tsx
useEffect(() => {
  let isMounted = true;                    // track if component is still mounted

  const initCanvas = async () => {         // define async function inside
    if (!canvasRef.current) return;
    const mod = await import('fabric');
    if (!isMounted) return;                // prevent state update on unmounted component
    // ... setup canvas
  };

  initCanvas();                            // call it (not awaited)

  return () => {                           // cleanup function
    isMounted = false;
    if (canvasInstanceRef.current) {
      canvasInstanceRef.current.dispose();
    }
  };
}, [size]);
```

## Key Files

- `lib/auth.ts` - Sequential async: find user, then compare password
- `lib/s3.ts` - Async S3 operations: upload, download, delete
- `lib/redis.ts` - Lazy async initialization with singleton pattern
- `lib/email.ts` - Non-throwing async pattern (returns result object)
- `app/api/hankos/route.ts` - Full async API route pattern
- `app/api/documents/route.ts` - Async file handling with FormData
- `components/HankoDesigner.tsx` - Async dynamic import in useEffect

## Common Pitfalls

1. **Forgetting `await`**: If you forget `await`, you get a Promise object instead of the resolved value. TypeScript helps catch this in many cases.
   ```javascript
   // Bug: returns a Promise, not the session
   const session = getServerSession(authOptions);  // missing await!
   ```

2. **Sequential when parallel is possible**: Unnecessary sequential awaits slow things down.
   ```javascript
   // Slow: sequential
   const hankos = await prisma.hanko.findMany({ ... });
   const documents = await prisma.document.findMany({ ... });

   // Fast: parallel (when results are independent)
   const [hankos, documents] = await Promise.all([
     prisma.hanko.findMany({ ... }),
     prisma.document.findMany({ ... }),
   ]);
   ```

3. **Unhandled Promise rejections**: Always wrap async code in try/catch, especially in API routes. An unhandled rejection will crash the process in newer Node.js versions.

4. **Async in forEach**: `Array.forEach` does not await async callbacks. Use `for...of` instead.
   ```javascript
   // Bug: doesn't wait for async operations
   users.forEach(async (user) => {
     await prisma.user.update({ ... });  // fires and forgets!
   });

   // Correct: sequential
   for (const user of users) {
     await prisma.user.update({ ... });
   }

   // Correct: parallel
   await Promise.all(users.map(user => prisma.user.update({ ... })));
   ```

## Resources

- [MDN: Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous)
- [MDN: async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript.info: Async/Await](https://javascript.info/async-await)
- [Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
