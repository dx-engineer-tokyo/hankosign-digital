# Prisma ORM

## What It Is

**Prisma** (5.9.0) is a type-safe ORM (Object-Relational Mapping) for Node.js and TypeScript. It replaces raw SQL with a fluent API that generates type-safe queries, handles migrations, and provides database tooling.

## Why We Use It

- **Type safety**: Prisma generates TypeScript types from the schema, catching query errors at compile time
- **Migration system**: Tracks schema changes in version-controlled migration files
- **Prisma Studio**: Visual database browser for development
- **Auto-completion**: Full IDE support for query building

## How It Works Here

### Prisma Client Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']   // verbose in dev
      : ['error'],                     // errors only in prod
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

**Why the singleton?** Next.js hot reloading re-executes modules, which would create new database connections each time. The `globalThis` pattern ensures only one PrismaClient exists during development.

### Query Patterns

**Find many with filtering and ordering:**
```typescript
const hankos = await prisma.hanko.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
});
```

**Find many with includes (joins):**
```typescript
const documents = await prisma.document.findMany({
  where: { createdById: session.user.id },
  include: {
    signatures: {
      include: {
        user: { select: { name: true, email: true } },
        hanko: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
});
```

**Find unique:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: credentials.email },
});
```

**Find first (with ownership check):**
```typescript
const hanko = await prisma.hanko.findFirst({
  where: {
    id: hankoId,
    userId: session.user.id,   // ensures ownership
  },
});
```

**Create:**
```typescript
const hanko = await prisma.hanko.create({
  data: {
    userId: session.user.id,
    name: validatedData.name,
    type: validatedData.type,
    imageUrl,
    imageData: validatedData.imageData,
    font: validatedData.font,
    size: validatedData.size,
  },
});
```

**Create with select (limit returned fields):**
```typescript
const user = await prisma.user.create({
  data: { email, password: hashedPassword, name },
  select: { id: true, email: true, name: true, createdAt: true },
  // password hash is NOT returned
});
```

**Update:**
```typescript
await prisma.document.update({
  where: { id: documentId },
  data: { status: 'IN_PROGRESS' },
});
```

**Delete:**
```typescript
await prisma.hanko.delete({
  where: { id: hankoId },
});
```

**Bulk create (seeding):**
```typescript
await prisma.auditLog.createMany({
  data: [
    { userId, action: 'DOCUMENT_CREATED', entityType: 'Document', entityId, ... },
    { userId, action: 'SIGNATURE_APPLIED', entityType: 'Signature', entityId, ... },
  ],
});
```

**Delete many (clearing data):**
```typescript
await prisma.auditLog.deleteMany();
await prisma.signature.deleteMany();
// Order matters - delete children before parents
```

### Migration Commands

```bash
# Create a new migration (interactive, names it)
npx prisma migrate dev

# Or via npm script
npm run db:migrate

# Generate Prisma Client (after schema changes)
npx prisma generate
# Or
npm run db:generate

# Open database GUI
npm run db:studio

# Seed the database
npm run db:seed
```

### Seeding

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (order matters for foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hanko.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  for (const userData of TEST_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await prisma.user.create({ data: { ...userData, password: hashedPassword } });
  }

  // Create sample documents, hankos, workflows...
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Database Connection

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Key Files

- `lib/prisma.ts` - Prisma client singleton
- `prisma/schema.prisma` - Data model definitions
- `prisma/migrations/` - Migration history
- `prisma/seed.ts` - Demo data seeder
- `package.json` - Database scripts (db:migrate, db:generate, db:studio, db:seed)

## Best Practices

1. **Use the singleton**: Always import from `@/lib/prisma`, never instantiate `new PrismaClient()` directly
2. **Select only needed fields**: Use `select` to avoid sending sensitive data (like password hashes)
3. **Ownership checks**: Use `findFirst` with `userId` to verify the requesting user owns the resource
4. **Delete order**: When clearing data, delete child records before parent records to avoid FK constraint violations

## Common Pitfalls

1. **Connection exhaustion**: Creating multiple PrismaClient instances exhausts the connection pool. Use the singleton.
2. **Missing `await`**: Prisma queries return Promises. Forgetting `await` returns the Promise object, not the data.
3. **Cascade delete surprises**: `onDelete: Cascade` in the schema means deleting a parent deletes all children. Intentional here but can be surprising.
4. **Migration drift**: Always run `prisma generate` after schema changes to keep the generated client in sync.

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/orm/prisma-client)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
