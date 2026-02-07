# Project Architecture & Tech Stack

## What It Is

HankoSign Digital is a full-stack web application that digitizes Japan's traditional hanko (seal/stamp) culture. It enables users to create digital hankos, upload documents, apply signatures, and manage approval workflows (稟議 - ringi) electronically.

The application is built as a Next.js monolith that handles both frontend rendering and backend API logic within a single deployable unit.

## Why This Architecture

### Monolith over Microservices
A Next.js monolith was chosen because:
- **Simplicity**: Single deployment, single codebase, no inter-service communication overhead
- **Developer velocity**: One repository, one build process, shared types between frontend and backend
- **Cost efficiency**: No need for multiple servers, API gateways, or service mesh
- **Next.js strengths**: Built-in API routes eliminate the need for a separate backend server

### Key Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 (App Router) | Server components, file-based routing, API routes, built-in optimization |
| Language | TypeScript | Type safety across full stack, Prisma type generation, better DX |
| Database | PostgreSQL + Prisma | Relational data with complex relations, type-safe ORM, migration system |
| Auth | NextAuth.js (JWT) | Battle-tested auth for Next.js, JWT for stateless sessions |
| Storage | AWS S3 | Scalable file storage, presigned URLs for secure access |
| Styling | Tailwind + DaisyUI | Utility-first CSS for rapid development, DaisyUI for pre-built components |
| i18n | next-intl | First-class Next.js App Router support, URL-based locale routing |

## System Architecture

```
                    ┌─────────────────────────────────────┐
                    │           Client Browser            │
                    │  (React 19 + Tailwind + DaisyUI)    │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │         Next.js 16 Server           │
                    │                                     │
                    │  ┌─────────────┐ ┌───────────────┐  │
                    │  │   Pages /   │ │  API Routes   │  │
                    │  │  Layouts    │ │  /api/*       │  │
                    │  │  (RSC +     │ │  (REST)       │  │
                    │  │   Client)   │ │               │  │
                    │  └─────────────┘ └───────┬───────┘  │
                    │                          │          │
                    │  ┌───────────────────────▼───────┐  │
                    │  │      Middleware (proxy.ts)     │  │
                    │  │  - Auth checks                │  │
                    │  │  - i18n routing               │  │
                    │  │  - Role-based redirects       │  │
                    │  └───────────────────────────────┘  │
                    └──────────┬────────┬─────────────────┘
                               │        │
              ┌────────────────▼─┐  ┌───▼──────────────┐
              │   PostgreSQL 14  │  │    AWS S3         │
              │   (via Prisma)   │  │  (Documents &     │
              │                  │  │   Hanko Images)   │
              │   - Users        │  │                   │
              │   - Hankos       │  │  MinIO (dev)      │
              │   - Documents    │  └───────────────────┘
              │   - Workflows    │
              │   - Approvals    │  ┌───────────────────┐
              │   - Signatures   │  │   Redis 6+        │
              │   - AuditLogs    │  │   (Caching)       │
              └──────────────────┘  └───────────────────┘

                                    ┌───────────────────┐
                                    │   SMTP (Gmail)    │
                                    │   Email Service   │
                                    └───────────────────┘
```

## Project Structure

```
hankosign-digital/
│
├── app/                          # Next.js App Router
│   ├── [locale]/                 # i18n locale routing (ja/en)
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Home page
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   ├── dashboard/            # Protected dashboard
│   │   │   ├── page.tsx          # Dashboard overview
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar)
│   │   │   ├── hankos/           # Hanko management
│   │   │   ├── documents/        # Document management
│   │   │   ├── signatures/       # Signature history
│   │   │   ├── workflows/        # Approval workflows
│   │   │   ├── settings/         # User settings
│   │   │   └── roles/            # Admin: user management
│   │   ├── verify/               # Public verification page
│   │   ├── about/                # About page
│   │   ├── contact/              # Contact form
│   │   ├── demo/                 # Demo page
│   │   ├── help/                 # Help/FAQ
│   │   ├── privacy/              # Privacy policy
│   │   ├── legal/                # Legal information
│   │   └── forgot-password/      # Password recovery
│   │
│   └── api/                      # REST API endpoints
│       ├── auth/                 # Authentication
│       │   ├── [...nextauth]/    # NextAuth handler
│       │   ├── register/         # User registration
│       │   └── forgot-password/  # Password reset
│       ├── hankos/               # Hanko CRUD
│       ├── documents/            # Document CRUD
│       ├── signatures/           # Signature creation
│       ├── user/                 # User profile management
│       │   ├── profile/
│       │   ├── password/
│       │   ├── company/
│       │   └── preferences/
│       ├── admin/                # Admin operations
│       │   └── users/
│       └── verify/               # Public verification
│
├── components/                   # React components
│   ├── AuthProvider.tsx          # NextAuth session provider
│   ├── HankoDesigner.tsx         # Canvas-based hanko creator
│   ├── HankoIcon.tsx             # Hanko SVG icon
│   ├── HomePage.tsx              # Landing page
│   └── Alert.tsx                 # Alert/notification component
│
├── lib/                          # Shared utility modules
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── redis.ts                  # Redis cache client
│   ├── s3.ts                     # AWS S3 operations
│   ├── email.ts                  # Email service (Nodemailer)
│   ├── permissions.ts            # RBAC permission system
│   └── utils.ts                  # Utility functions
│
├── prisma/                       # Database layer
│   ├── schema.prisma             # Data model definitions
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Demo data seeder
│
├── i18n/                         # Internationalization
│   ├── routing.ts                # Locale configuration
│   ├── request.ts                # Server-side message loading
│   └── navigation.ts            # Locale-aware Link, redirect, etc.
│
├── messages/                     # Translation files
│   ├── ja.json                   # Japanese
│   └── en.json                   # English
│
├── types/                        # TypeScript type declarations
├── public/                       # Static assets
├── docs/                         # Project documentation
│
├── proxy.ts                      # Next.js middleware
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind + DaisyUI theme
├── docker-compose.yml            # MinIO S3 mock
└── .env                          # Environment variables
```

## Data Flow

### Document Signing Flow
```
1. User creates hanko        → POST /api/hankos → Prisma → DB + S3
2. User uploads document     → POST /api/documents → Prisma → DB + S3
3. User applies signature    → POST /api/signatures → Prisma → DB
4. Document status updates   → DRAFT → IN_PROGRESS → COMPLETED
5. Verification code issued  → Unique code + optional QR code
6. Public verification       → GET /verify?code=XXXX-XXXX-XXXX
```

### Approval Workflow Flow (稟議)
```
1. Creator submits document  → Status: PENDING
2. Workflow created          → Sequential or parallel steps
3. Each approver notified    → Email notification sent
4. Approver reviews          → APPROVED / REJECTED / SKIPPED
5. Next step triggered       → currentStep incremented
6. All approved              → Document COMPLETED
7. Any rejected              → Document REJECTED
```

### Authentication Flow
```
1. User submits credentials  → POST /api/auth/callback/credentials
2. NextAuth validates        → bcrypt.compare(password, hash)
3. JWT token issued          → Contains: id, email, role
4. Session stored            → 30-day expiry
5. Subsequent requests       → JWT verified via middleware
6. Role checked              → USER / ADMIN / SUPER_ADMIN
```

## Key Design Patterns

### 1. Singleton Pattern (Prisma Client)
The Prisma client is instantiated once and reused across all API routes to prevent connection pool exhaustion during development hot reloading.

**File:** `lib/prisma.ts`

### 2. Provider Pattern (Auth)
Authentication state is provided to the component tree via React Context through the `AuthProvider` wrapper component.

**File:** `components/AuthProvider.tsx`

### 3. Middleware Chain
Request processing flows through: Next.js middleware (proxy.ts) → i18n routing → auth checks → page/API route handler.

**File:** `proxy.ts`

### 4. Schema Validation at Boundary
All API inputs are validated using Zod schemas before any database operations. This ensures data integrity and provides clear error messages.

**Files:** All `app/api/*/route.ts` files

### 5. Role-Based Access Control
A permission matrix maps roles to capabilities, with server-side helper functions that enforce access rules.

**File:** `lib/permissions.ts`

## Environment Overview

| Environment | Database | S3 Storage | Email | Redis |
|-------------|----------|------------|-------|-------|
| Development | PostgreSQL (Docker) | MinIO (Docker) | Gmail SMTP | Redis (Docker) |
| Production | PostgreSQL (managed) | AWS S3 | SMTP provider | Redis (managed) |

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com)
