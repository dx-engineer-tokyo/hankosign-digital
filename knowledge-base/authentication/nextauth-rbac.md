# NextAuth.js & Role-Based Access Control

## What It Is

**NextAuth.js** (4.24.5) is an authentication library for Next.js that handles user sessions, JWT tokens, and login flows. This project extends it with a **Role-Based Access Control (RBAC)** system that restricts features based on user roles.

## Why We Use It

- **Purpose-built for Next.js**: Tight integration with App Router, middleware, and API routes
- **JWT strategy**: Stateless sessions that don't require server-side session storage
- **Credentials provider**: Email/password authentication matching Japanese business expectations
- **Extensible**: Custom callbacks to add role information to sessions

## How It Works Here

### Authentication Configuration

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください');
        }

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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',      // custom login page
    error: '/login',        // redirect errors to login
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,  // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;       // add custom fields to JWT
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
```

### Login Flow

```
1. User enters email + password on /login page
2. Credentials sent to POST /api/auth/callback/credentials
3. authorize() function runs:
   a. Find user by email in database
   b. Compare password with bcrypt hash (12 salt rounds)
   c. Return user object or throw error
4. JWT callback: add id and role to token
5. Session callback: expose id and role on session.user
6. JWT stored in cookie (30-day expiry)
7. Subsequent requests: JWT verified automatically
```

### Registration Flow

```typescript
// app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = registerSchema.parse(body);

  // Check for existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });
  if (existingUser) {
    return NextResponse.json({ error: 'Already registered' }, { status: 400 });
  }

  // Hash password with bcryptjs (12 salt rounds)
  const hashedPassword = await hash(validatedData.password, 12);

  // Create user with default role (USER)
  const user = await prisma.user.create({
    data: { ...validatedData, password: hashedPassword },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
```

### Password Requirements

```typescript
z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'Password must include uppercase letters')
  .regex(/[a-z]/, 'Password must include lowercase letters')
  .regex(/[0-9]/, 'Password must include numbers')
```

### Session Provider

```typescript
// components/AuthProvider.tsx
'use client';
import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// Wrapped in app/[locale]/layout.tsx
<AuthProvider>{children}</AuthProvider>
```

### Accessing Session

**Client-side:**
```typescript
'use client';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();
  // session.user.id, session.user.name, session.user.role
}
```

**API routes:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  // session.user.id available for queries
}
```

**Middleware:**
```typescript
import { getToken } from 'next-auth/jwt';

const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
if (!token) { /* redirect to login */ }
```

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
SUPER_ADMIN
    ↓ (inherits all ADMIN permissions)
  ADMIN
    ↓ (inherits all USER permissions)
   USER
```

### Permission Matrix

```typescript
// lib/permissions.ts
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

| Permission | USER | ADMIN | SUPER_ADMIN |
|-----------|------|-------|-------------|
| Create hankos | Yes | Yes | Yes |
| Upload documents | Yes | Yes | Yes |
| Sign documents | Yes | Yes | Yes |
| Approve workflows | Yes | Yes | Yes |
| Manage roles | No | Yes | Yes |
| Manage organization | No | Yes | Yes |
| View reports | No | Yes | Yes |
| Assign super admin | No | No | Yes |
| Manage system | No | No | Yes |
| View audit logs | No | No | Yes |

### Permission Helpers

```typescript
// lib/permissions.ts
export const getRolePermissions = (role: UserRole): Permission => {
  switch (role) {
    case 'USER':
      return { ...basePermissions, canCreateHankos: true, canUploadDocs: true, ... };
    case 'ADMIN':
      return { ...basePermissions, canManageRoles: true, canViewReports: true, ... };
    case 'SUPER_ADMIN':
      return { canCreateHankos: true, canManageSystem: true, canViewAuditLogs: true, ... };
  }
};

export const hasAdminAccess = (role: UserRole): boolean => {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};

export const hasSuperAdminAccess = (role: UserRole): boolean => {
  return role === 'SUPER_ADMIN';
};
```

### Server-Side Route Protection

```typescript
// lib/permissions.ts
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const userRole = (session.user as any).role as UserRole;
  if (!hasAdminAccess(userRole)) redirect('/dashboard');
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAuth();
  const userRole = (session.user as any).role as UserRole;
  if (!hasSuperAdminAccess(userRole)) redirect('/dashboard');
  return session;
}
```

### Middleware-Level Protection

```typescript
// proxy.ts - protects /dashboard/roles for admins only
if (pathname.includes('/dashboard/roles')) {
  const userRole = token.role as string;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
  }
}
```

### Protection Layers

```
Layer 1: Middleware (proxy.ts)
  → Redirects unauthenticated users from /dashboard/*
  → Redirects non-admin users from /dashboard/roles

Layer 2: Server Components (requireAuth/requireAdmin)
  → Used in page components for server-side protection

Layer 3: API Routes (getServerSession)
  → Returns 401 for unauthenticated API requests
  → Ownership checks filter data by userId
```

## Test Credentials

From the seed data:

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@hankosign.jp | Admin@123456 |
| ADMIN | manager@hankosign.jp | Manager@123456 |
| USER | user1@hankosign.jp | User@123456 |
| USER | user2@hankosign.jp | User@123456 |
| USER | external@example.com | External@123456 |

## Environment Variables

```
NEXTAUTH_URL=http://localhost:3000        # App URL
NEXTAUTH_SECRET=your-secret-key-here      # JWT signing secret (min 32 chars for production)
```

## Key Files

- `lib/auth.ts` - NextAuth configuration, credentials provider, JWT callbacks
- `lib/permissions.ts` - RBAC permission matrix, helper functions, route protection
- `components/AuthProvider.tsx` - Client-side session provider
- `proxy.ts` - Middleware auth checks
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `app/api/auth/register/route.ts` - User registration endpoint

## Best Practices

1. **Defense in depth**: Protect at middleware, component, and API route levels
2. **Same error messages**: Use identical messages for "user not found" and "wrong password" to prevent user enumeration
3. **Strong password hashing**: bcryptjs with 12 salt rounds provides strong protection
4. **Select fields carefully**: Never return password hashes in API responses

## Common Pitfalls

1. **Forgetting NEXTAUTH_SECRET**: Required in production. Without it, sessions won't work
2. **Custom session fields**: NextAuth types don't include custom fields (id, role). Type assertions are needed.
3. **Client vs server session access**: `useSession()` on client, `getServerSession()` on server. Don't mix them.
4. **JWT size**: Adding too much data to JWT increases cookie size and request overhead

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Credentials Provider](https://next-auth.js.org/providers/credentials)
- [NextAuth.js JWT Callbacks](https://next-auth.js.org/configuration/callbacks#jwt-callback)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
