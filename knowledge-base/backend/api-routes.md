# API Routes

## What It Is

HankoSign Digital's backend is implemented entirely as Next.js API Routes - server-side functions that handle HTTP requests at `/api/*` paths. There is no separate backend server.

## Why We Use It

- **Collocated**: API code lives alongside the frontend in the same repository
- **Type-safe**: Shared TypeScript types between frontend and backend
- **Zero config**: Next.js handles routing, bundling, and deployment
- **Serverless-ready**: Each route can be deployed as an independent function

## How It Works Here

### Route File Convention

API routes use `route.ts` files with named exports matching HTTP methods:

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts    → /api/auth/* (NextAuth handler)
│   ├── register/route.ts        → POST /api/auth/register
│   └── forgot-password/route.ts → POST /api/auth/forgot-password
├── hankos/route.ts               → GET, POST, DELETE /api/hankos
├── documents/route.ts            → GET, POST, DELETE /api/documents
├── signatures/route.ts           → POST /api/signatures
├── user/
│   ├── profile/route.ts         → GET, PUT /api/user/profile
│   ├── password/route.ts        → POST /api/user/password
│   ├── company/route.ts         → POST /api/user/company
│   └── preferences/route.ts    → GET, PUT /api/user/preferences
├── admin/
│   └── users/route.ts           → GET /api/admin/users (+role management)
└── verify/route.ts               → GET /api/verify
```

### Standard API Route Pattern

Every route follows this structure:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// 1. Define validation schema
const schema = z.object({
  field: z.string().min(1, 'Required'),
});

// 2. Export handler function
export async function POST(request: NextRequest) {
  try {
    // 3. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 4. Validate input
    const body = await request.json();
    const data = schema.parse(body);

    // 5. Authorization (ownership check)
    // e.g., verify the resource belongs to the user

    // 6. Business logic
    const result = await prisma.model.create({ data: { ... } });

    // 7. Return response
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    // 8. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
```

### Hanko CRUD (app/api/hankos/route.ts)

**GET** - List user's hankos:
```typescript
const hankos = await prisma.hanko.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
});
return NextResponse.json({ hankos });
```

**POST** - Create hanko:
```typescript
// Validates with Zod, converts base64 to buffer, uploads to S3, saves to DB
const base64Data = validatedData.imageData.replace(/^data:image\/\w+;base64,/, '');
const buffer = Buffer.from(base64Data, 'base64');
const imageUrl = await uploadFile(s3Key, buffer, 'image/png');
const hanko = await prisma.hanko.create({ data: { ... } });
return NextResponse.json({ hanko }, { status: 201 });
```

**DELETE** - Delete hanko (with ownership verification):
```typescript
const hanko = await prisma.hanko.findFirst({
  where: { id: hankoId, userId: session.user.id },  // ownership check
});
if (!hanko) return NextResponse.json({ error: 'Hanko not found' }, { status: 404 });
await prisma.hanko.delete({ where: { id: hankoId } });
```

### Document Upload (app/api/documents/route.ts)

Handles multipart file upload with validation:
```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Validate file size (20MB max)
  if (file.size > 20 * 1024 * 1024) { ... }

  // Validate MIME type
  const ALLOWED = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png', ...];
  if (!ALLOWED.includes(file.type)) { ... }

  // Read file, upload to S3, save to database
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileUrl = await uploadFile(s3Key, buffer, file.type);
  const document = await prisma.document.create({ data: { ... } });
}
```

### Signature Application (app/api/signatures/route.ts)

Business logic includes state validation:
```typescript
// Prevent signing completed/rejected/archived documents
const NON_SIGNABLE = ['COMPLETED', 'REJECTED', 'ARCHIVED'];
if (NON_SIGNABLE.includes(document.status)) {
  return NextResponse.json({ error: 'This document cannot be signed' }, { status: 400 });
}

// Create signature with metadata
const signature = await prisma.signature.create({
  data: {
    documentId, hankoId, userId: session.user.id,
    positionX, positionY, page,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim(),
    userAgent: request.headers.get('user-agent'),
  },
});

// Update document status
await prisma.document.update({
  where: { id: documentId },
  data: { status: 'IN_PROGRESS' },
});
```

### User Registration (app/api/auth/register/route.ts)

Public endpoint (no auth required):
```typescript
// Check for existing user
const existingUser = await prisma.user.findUnique({ where: { email } });
if (existingUser) {
  return NextResponse.json({ error: 'Already registered' }, { status: 400 });
}

// Hash password (bcryptjs with 12 salt rounds)
const hashedPassword = await hash(validatedData.password, 12);

// Create user (select only safe fields for response)
const user = await prisma.user.create({
  data: { email, password: hashedPassword, name, ... },
  select: { id: true, email: true, name: true, createdAt: true },
});
```

## Response Format Conventions

```typescript
// Success - single resource
{ "hanko": { ... } }
{ "document": { ... } }
{ "signature": { ... } }

// Success - collection
{ "hankos": [...] }
{ "documents": [...] }

// Success - message only
{ "message": "Hanko deleted successfully" }

// Error - single message
{ "error": "Authentication required" }
{ "error": "Hanko not found" }
{ "error": "File size must be 20MB or less" }
```

## HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Validation errors, invalid state |
| 401 | Unauthorized | Missing or invalid session |
| 404 | Not Found | Resource doesn't exist or not owned by user |
| 500 | Internal Server Error | Unexpected errors |

## Key Files

- `app/api/hankos/route.ts` - Complete CRUD example
- `app/api/documents/route.ts` - File upload handling
- `app/api/signatures/route.ts` - Business logic with state validation
- `app/api/auth/register/route.ts` - Public endpoint with password hashing
- `app/api/auth/[...nextauth]/route.ts` - NextAuth catch-all handler

## Best Practices

1. **Always authenticate first**: Check session before any database operation
2. **Always validate input**: Use Zod schemas for JSON bodies, manual checks for FormData
3. **Always verify ownership**: Don't let users access other users' resources
4. **Return appropriate status codes**: 201 for creation, 400 for client errors, etc.
5. **Log errors server-side**: `console.error` for debugging, generic messages for clients

## Common Pitfalls

1. **Forgetting ownership checks**: A user could access another user's resources without `userId` filtering
2. **Exposing sensitive data**: Password hashes, internal IDs. Use Prisma `select` to limit response fields
3. **Not handling all HTTP methods**: If a route only handles POST, GET requests will return 405 automatically

## Resources

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextRequest API](https://nextjs.org/docs/app/api-reference/functions/next-request)
- [NextResponse API](https://nextjs.org/docs/app/api-reference/functions/next-response)
