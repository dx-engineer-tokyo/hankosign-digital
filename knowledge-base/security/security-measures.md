# Security Measures

## What It Is

This document covers all security measures implemented in HankoSign Digital, including authentication, input validation, data protection, HTTP headers, and compliance with Japanese regulations.

## Why It Matters

As a document signing platform handling legal documents and personal information, security is critical:
- **Legal compliance**: Must meet Japanese electronic signature law requirements
- **Data protection**: Personal data, corporate documents, and financial information
- **Trust**: Users must trust that their signatures and documents are secure

## Security Layers

### 1. Authentication Security

**Password Hashing:**
```typescript
// Registration: hash with bcryptjs (12 salt rounds)
const hashedPassword = await hash(validatedData.password, 12);

// Login: constant-time comparison
const isPasswordValid = await compare(credentials.password, user.password);
```

- **bcryptjs with 12 rounds**: Computationally expensive to make brute force attacks impractical
- **Constant-time comparison**: `bcrypt.compare` prevents timing attacks
- **Identical error messages**: "メールアドレスまたはパスワードが正しくありません" for both wrong email and wrong password prevents user enumeration

**Password Policy:**
```typescript
z.string()
  .min(8)                    // minimum length
  .max(128)                  // maximum length
  .regex(/[A-Z]/)            // uppercase required
  .regex(/[a-z]/)            // lowercase required
  .regex(/[0-9]/)            // number required
```

**JWT Sessions:**
- 30-day expiry
- Signed with NEXTAUTH_SECRET
- Contains: user ID, email, role (no sensitive data)
- Stored in httpOnly cookies (handled by NextAuth.js)

### 2. HTTP Security Headers

```javascript
// next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}
```

| Header | Purpose |
|--------|---------|
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing attacks |
| `X-Frame-Options: DENY` | Prevents clickjacking by blocking iframe embedding |
| `X-XSS-Protection: 1; mode=block` | Enables browser's XSS filter |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limits referrer info sent to other origins |
| `Permissions-Policy: camera=(), microphone=(), geolocation=()` | Disables unnecessary browser APIs |

### 3. Input Validation

**Zod schema validation on all API inputs:**
```typescript
// Every POST/PUT API route validates input before processing
const body = await request.json();
const validatedData = schema.parse(body);  // throws if invalid
```

**File upload validation:**
```typescript
// Size limit (20MB)
if (file.size > 20 * 1024 * 1024) { reject }

// MIME type whitelist
const ALLOWED = ['application/pdf', 'application/msword', ...];
if (!ALLOWED.includes(file.type)) { reject }
```

**Hanko image size limit:**
```typescript
const MAX_IMAGE_DATA_LENGTH = 500_000;  // ~375KB decoded
imageData: z.string().max(MAX_IMAGE_DATA_LENGTH, 'Image data is too large')
```

### 4. Authorization & Access Control

**Three-layer protection:**

```
Middleware (proxy.ts)     → Page-level: redirects to login / dashboard
Server Components         → Component-level: requireAuth(), requireAdmin()
API Routes                → Request-level: getServerSession() + 401 response
```

**Ownership verification:**
```typescript
// Always filter by userId to prevent accessing other users' data
const hanko = await prisma.hanko.findFirst({
  where: {
    id: hankoId,
    userId: session.user.id,   // ownership check
  },
});
if (!hanko) return 404;
```

**State validation:**
```typescript
// Prevent signing completed/rejected/archived documents
const NON_SIGNABLE = ['COMPLETED', 'REJECTED', 'ARCHIVED'];
if (NON_SIGNABLE.includes(document.status)) {
  return NextResponse.json({ error: 'Cannot sign' }, { status: 400 });
}
```

### 5. Data Protection

**Sensitive field exclusion:**
```typescript
// Never return password hashes
const user = await prisma.user.create({
  data: { ... },
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    // password is NOT selected
  },
});
```

**S3 presigned URLs:**
```typescript
// Time-limited access (default 1 hour)
const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
// URL expires after the time limit, preventing indefinite access
```

**File name sanitization:**
```typescript
// lib/utils.ts
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// lib/s3.ts
const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
```

### 6. Email Security

**HTML injection prevention:**
```typescript
// lib/email.ts
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// User content is always escaped in email templates
<p>${escapeHtml(userName)}様</p>
<p><strong>文書名:</strong> ${escapeHtml(documentTitle)}</p>
```

**URL encoding:**
```typescript
<a href="${encodeURI(documentUrl)}">文書を確認する</a>
```

### 7. Audit Trail

```prisma
model AuditLog {
  userId      String?    // who performed the action
  action      String     // what was done
  entityType  String     // what type of entity
  entityId    String     // which entity
  ipAddress   String?    // where from
  userAgent   String?    // what browser
  timestamp   DateTime   // when
  details     Json?      // additional context
}
```

**Tracked actions:**
- DOCUMENT_CREATED
- SIGNATURE_APPLIED
- APPROVAL_REJECTED
- (and more)

**Signature metadata for legal compliance:**
```typescript
const signature = await prisma.signature.create({
  data: {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim(),
    userAgent: request.headers.get('user-agent'),
  },
});
```

### 8. UUID Primary Keys

All database records use UUIDs instead of sequential integers:
```prisma
id String @id @default(uuid())
```

This prevents:
- **Enumeration attacks**: Can't guess IDs by incrementing
- **Information disclosure**: No ordering information leaked

### 9. Environment Variable Protection

- `.env` is in `.gitignore` (never committed)
- `.env.example` provides a template without real values
- `NEXTAUTH_SECRET` is required (throws error if missing):
  ```typescript
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET environment variable is not set');
  }
  ```

## Japanese Regulatory Compliance

### Electronic Signatures Act (電子署名法)

The project is designed to comply with Japan's Electronic Signatures and Certification Business Act:

- **Identity verification**: User authentication via email/password
- **Document integrity**: Verification codes for signed documents
- **Non-repudiation**: Signatures link user, hanko, timestamp, and IP address
- **Audit trail**: AuditLog records all actions with timestamps

### Electronic Books Preservation Act (電子帳簿保存法)

Requires 7-year retention of electronic records:

- **AuditLog indexed by timestamp**: Enables efficient historical queries
- **S3 storage**: Documents stored immutably (no overwrite)
- **Verification codes**: Public verification portal for signed documents

## Areas for Improvement

| Area | Current State | Recommendation |
|------|--------------|----------------|
| Rate limiting | Not implemented | Add per-IP and per-user rate limits |
| CSRF protection | NextAuth handles for auth routes | Verify for custom API routes |
| Content Security Policy | Not set | Add CSP header to prevent XSS |
| 2FA/MFA | Not implemented | Add TOTP or WebAuthn support |
| PKI certificates | Schema supports it, not implemented | Integrate with certificate authorities |
| Input sanitization | Zod validation only | Consider output encoding for stored HTML |
| Session revocation | JWT-only (no server-side invalidation) | Add Redis-based token blacklist |

## Key Files

- `lib/auth.ts` - Authentication configuration, password comparison
- `lib/permissions.ts` - RBAC system, route protection helpers
- `lib/email.ts` - HTML escaping, secure email templates
- `lib/s3.ts` - File name sanitization, key generation
- `lib/utils.ts` - Utility sanitization functions
- `next.config.js` - Security headers
- `proxy.ts` - Middleware auth and role checks
- `prisma/schema.prisma` - AuditLog model, UUID keys

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Guide](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/introduction#security)
- [Japan Electronic Signatures Act](https://www.japaneselawtranslation.go.jp/)
- [bcryptjs Security](https://github.com/dcodeIO/bcrypt.js#security-considerations)
