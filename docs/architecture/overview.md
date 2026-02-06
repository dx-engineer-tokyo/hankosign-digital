# System Architecture Overview

## Introduction

HankoSign Digital is a Next.js 16-based full-stack application that implements a digital hanko (seal) management and electronic signature platform. The architecture follows a modern monolithic approach with Next.js App Router, combining server-side rendering, API routes, and client-side interactivity.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  (Next.js App Router, React 19, TypeScript)             │
│  • Dashboard UI    • Hanko Designer   • Document Viewer │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  Middleware Layer                        │
│  • Proxy (i18n, Auth routing)                           │
│  • NextAuth.js Session Management                       │
│  • Permission Checking (RBAC)                           │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  (Next.js API Routes)                                   │
│  • /api/auth/*      • /api/hankos/*                     │
│  • /api/documents/* • /api/signatures/*                 │
│  • /api/admin/*     • /api/user/*                       │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  • PostgreSQL (Prisma ORM)                              │
│  • Redis (Session & Cache)                              │
│  • AWS S3 (File Storage)                                │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 16** - Full-stack React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS + DaisyUI** - Styling framework
- **Fabric.js** - Canvas-based hanko designer
- **React-PDF** - PDF document rendering
- **Lucide React** - Icon library
- **Chart.js** - Data visualization

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **NextAuth.js** - Authentication and session management
- **Prisma ORM** - Database access layer
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing

### Database & Storage
- **PostgreSQL** - Primary relational database
- **Redis** - Session storage and caching
- **AWS S3** - Document and image file storage

### Internationalization
- **next-intl** - Multi-language support (Japanese/English)

## Core Components

### 1. Authentication System

**Implementation:** NextAuth.js with Credentials provider

**Flow:**
1. User submits login credentials
2. NextAuth validates against PostgreSQL via Prisma
3. Session token stored in Redis
4. JWT issued for client-side session management
5. Proxy middleware protects authenticated routes

**Files:**
- `/lib/auth.ts` - NextAuth configuration
- `/app/api/auth/[...nextauth]/route.ts` - Auth endpoints
- `/proxy.ts` - Route protection middleware

### 2. Role-Based Access Control (RBAC)

**Roles:**
- **USER** - Standard users (create hankos, sign documents)
- **ADMIN** - Administrative access (manage users, view reports)
- **SUPER_ADMIN** - Full system access (assign roles, system settings)

**Protection Layers:**
1. **Proxy Layer** - Redirects unauthorized route access
2. **API Layer** - Server-side permission checks
3. **UI Layer** - Conditional rendering based on role

**Files:**
- `/lib/permissions.ts` - Permission helper functions
- `/docs/architecture/security-rbac.md` - Detailed RBAC documentation

### 3. Digital Hanko Management

**Features:**
- Create digital representations of physical seals
- Three seal types: Mitomein (認印), Ginkoin (銀行印), Jitsuin (実印)
- Canvas-based designer using Fabric.js
- Image storage in AWS S3 + base64 in database

**Database:** `Hanko` model

**API Endpoints:**
- `POST /api/hankos` - Create new hanko
- `GET /api/hankos` - List user's hankos
- `DELETE /api/hankos/[id]` - Delete hanko

### 4. Document Management

**Features:**
- Upload PDF, Word, and image documents
- Document status tracking (Draft → Pending → In Progress → Completed)
- Verification code generation for public validation
- QR code linking to verification portal

**Storage:**
- Files stored in AWS S3
- Metadata in PostgreSQL

**Database:** `Document` model

**API Endpoints:**
- `POST /api/documents` - Upload document
- `GET /api/documents` - List user's documents
- `GET /api/documents/[id]` - Get document details
- `DELETE /api/documents/[id]` - Delete document

### 5. Electronic Signature System

**Features:**
- Apply digital hanko to documents
- Position tracking (X, Y coordinates, page number)
- Timestamp and IP address recording
- Certificate data storage for legal compliance

**Database:** `Signature` model

**API Endpoints:**
- `POST /api/signatures` - Create signature
- `GET /api/signatures?documentId=[id]` - List document signatures

### 6. Approval Workflow (Ringi System)

**Features:**
- Sequential approval chains (ringi 稟議)
- Multi-step document approval
- Proxy approval support (代理)
- Deadline tracking and reminders

**Database:** `Workflow` + `Approval` models

**Status Flow:**
```
DRAFT → PENDING → IN_PROGRESS → COMPLETED
                              ↘ REJECTED
```

### 7. Verification Portal

**Features:**
- Public verification of document authenticity
- Validation without authentication
- View signature chain and timestamps
- QR code-based quick access

**Route:** `/verify/[code]`

## Data Flow Examples

### Example 1: Document Signing Flow

```
1. User uploads document
   → POST /api/documents
   → File saved to S3
   → Metadata + verification code stored in PostgreSQL

2. User selects hanko and applies signature
   → POST /api/signatures
   → Signature position and timestamp recorded
   → Document status updated to IN_PROGRESS

3. Document verification
   → Public access: GET /verify/[code]
   → Display all signatures with timestamps
   → No authentication required
```

### Example 2: Approval Workflow Flow

```
1. Document creator initiates workflow
   → POST /api/workflows
   → Creates approval chain (Approval records)

2. Each approver receives notification
   → Email via Nodemailer
   → Dashboard notification

3. Approver applies hanko
   → POST /api/signatures
   → Links to Approval record
   → Updates approval status to APPROVED
   → Workflow proceeds to next step

4. Final approval completes workflow
   → Document status → COMPLETED
   → All participants notified
```

## Security Architecture

### Authentication & Authorization
- **Session Management:** NextAuth.js with Redis storage
- **Password Security:** bcrypt hashing (10 salt rounds)
- **JWT Tokens:** 30-day expiration
- **RBAC:** Multi-layer permission checks

### Data Protection
- **Encryption at Rest:** PostgreSQL encryption, S3 server-side encryption
- **Encryption in Transit:** HTTPS/TLS
- **Input Validation:** Zod schemas on all API inputs
- **SQL Injection Prevention:** Prisma parameterized queries

### Audit Trail
- **AuditLog Model:** Records all critical operations
- **Tracked Data:** User ID, action type, entity details, IP, user agent, timestamp
- **Use Cases:** Compliance, forensics, debugging

See [security-rbac.md](./security-rbac.md) for detailed security documentation.

## Internationalization

**Supported Languages:**
- Japanese (ja) - Primary
- English (en) - Secondary

**Implementation:**
- next-intl for translations
- Locale-based routing: `/ja/*` and `/en/*`
- Translation files in `/messages/`

**Considerations:**
- Business terminology (判子, 稟議, etc.)
- Date formats (Japanese Era calendar)
- Form validation messages
- Error messages

## Performance Optimizations

### Caching Strategy
- **Redis:** Session data, frequently accessed user data
- **Next.js:** Static page generation where possible
- **S3 Presigned URLs:** Reduce server load for file downloads

### Database Indexing
- User email (unique)
- Document status, verification code
- Signature document ID, user ID
- Timestamps for audit logs

See `prisma/schema.prisma` for full index definitions.

## Deployment Architecture

### Recommended Stack
- **Hosting:** Vercel (optimal for Next.js)
- **Database:** Managed PostgreSQL (AWS RDS, Supabase)
- **Cache:** Redis Cloud, AWS ElastiCache
- **Storage:** AWS S3 (Tokyo region)
- **Email:** AWS SES, SendGrid

### Environment Variables
See `.env.example` for required configuration:
- Database connection strings
- AWS credentials and S3 bucket
- NextAuth secret and URL
- Redis URL
- SMTP settings

## Monitoring & Observability

### Current Implementation
- Console logging
- Error boundaries in Next.js

### Recommended Additions
- Application monitoring (Sentry, DataDog)
- Database query performance monitoring
- S3 access metrics
- User activity analytics

## Scalability Considerations

### Current Limits
- Single-region deployment
- Monolithic architecture
- Direct S3 access from application

### Future Scaling Strategies
- **Database:** Read replicas, connection pooling
- **Cache:** Redis cluster mode
- **Storage:** CDN for document delivery (CloudFront)
- **API:** Rate limiting, queuing for heavy operations
- **Microservices:** Split workflow engine, signature processing

## Compliance & Legal

### Japanese Regulations
- **電子署名法** (Electronic Signature Act)
- **電子帳簿保存法** (Electronic Books Preservation Act)
- **個人情報保護法** (Personal Information Protection Act)

### Implementation Notes
- Timestamp recording for signatures
- Audit trail maintenance
- Secure data storage
- User consent management

See project requirements for detailed compliance features.

## Related Documentation

- [Security & RBAC](./security-rbac.md) - Detailed security architecture
- [Database Schema](./database-schema.md) - Data model documentation
- [API Reference](../api/) - API endpoint documentation
- [Glossary](../reference/glossary.md) - Japanese business terms

---

**Last Updated:** 2025-02-06
**Version:** 0.1.0
