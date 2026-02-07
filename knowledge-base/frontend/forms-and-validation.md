# Forms & Validation

## What It Is

The project uses **React Hook Form** (7.49.3) for form state management and **Zod** (3.22.4) for schema validation. Together with **@hookform/resolvers** (3.3.4), they provide type-safe form handling with declarative validation rules.

## Why We Use It

- **React Hook Form**: Minimal re-renders, uncontrolled inputs for performance, simple API
- **Zod**: Runtime validation that integrates with TypeScript types
- **@hookform/resolvers**: Bridge between React Hook Form and Zod schemas
- **Consistent validation**: Same Zod schemas validate both client-side forms and server-side API routes

## How It Works Here

### Zod Schema Definition

Schemas are defined in API route files and used for server-side validation:

```typescript
// app/api/auth/register/route.ts
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must include uppercase letters')
    .regex(/[a-z]/, 'Password must include lowercase letters')
    .regex(/[0-9]/, 'Password must include numbers'),
  name: z.string().min(1, 'Please enter your name').max(100),
  nameKana: z.string().max(100).optional(),
  companyName: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
});

// app/api/hankos/route.ts
const hankoSchema = z.object({
  name: z.string().min(1, 'Please enter a hanko name').max(50),
  type: z.enum(['MITOMEIN', 'GINKOIN', 'JITSUIN']),
  imageData: z.string().max(500_000, 'Image data is too large'),
  font: z.string().max(100).optional(),
  size: z.number().int().min(20).max(500).default(60),
});

// app/api/signatures/route.ts
const signatureSchema = z.object({
  documentId: z.string().uuid(),
  hankoId: z.string().uuid(),
  positionX: z.number().min(0),
  positionY: z.number().min(0),
  page: z.number().int().min(1).default(1),
});
```

### Server-Side Validation Pattern

Every POST API route follows this pattern:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Parse and validate
    const body = await request.json();
    const validatedData = schema.parse(body);  // throws ZodError if invalid

    // 3. Business logic with validated data
    const result = await prisma.model.create({ data: validatedData });

    // 4. Success response
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    // 5. Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },  // first error message
        { status: 400 }
      );
    }

    // 6. Handle all other errors
    console.error('Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
```

### File Upload Validation

Document uploads use manual validation since FormData isn't a JSON body:

```typescript
// app/api/documents/route.ts
const formData = await request.formData();
const file = formData.get('file') as File;
const title = formData.get('title') as string;

// File presence check
if (!file) {
  return NextResponse.json({ error: 'Please select a file' }, { status: 400 });
}

// Size validation (20MB max)
const MAX_FILE_SIZE = 20 * 1024 * 1024;
if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json({ error: 'File size must be 20MB or less' }, { status: 400 });
}

// MIME type whitelist
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];
if (!ALLOWED_MIME_TYPES.includes(file.type)) {
  return NextResponse.json({ error: 'File format not permitted' }, { status: 400 });
}
```

### Password Validation Rules

```typescript
// Comprehensive password schema
z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'Password must include uppercase letters')
  .regex(/[a-z]/, 'Password must include lowercase letters')
  .regex(/[0-9]/, 'Password must include numbers')
```

## Key Files

- `app/api/auth/register/route.ts` - Registration schema with comprehensive validation
- `app/api/hankos/route.ts` - Hanko creation schema
- `app/api/documents/route.ts` - File upload validation (manual)
- `app/api/signatures/route.ts` - Signature placement schema with UUID validation

## Best Practices

1. **Define schemas at file top**: Makes validation rules visible and easy to review
2. **Specific error messages**: Each validation rule should have a human-readable message
3. **Validate at the boundary**: Always validate untrusted input (API routes, form submissions)
4. **Match Prisma constraints**: Zod max lengths should match database column limits

## Common Pitfalls

1. **Forgetting `.optional()`**: Zod fields are required by default. Optional fields need explicit `.optional()`
2. **Type mismatch with FormData**: FormData values are always strings. Use `z.coerce.number()` for numeric fields from forms
3. **Missing error handling**: Always catch `z.ZodError` separately from general errors
4. **Client-server schema sync**: If validation rules change on the server, client schemas should match

## Resources

- [Zod Documentation](https://zod.dev/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [React Hook Form + Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
