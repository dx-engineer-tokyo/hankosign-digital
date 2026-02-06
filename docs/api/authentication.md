# Authentication API

## Overview

The Authentication API provides endpoints for user registration, login, password management, and session management. Authentication is handled through NextAuth.js with a custom credentials provider.

## Base URL

```
/api/auth
```

## Endpoints

### Register New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "山田太郎",
  "nameKana": "ヤマダタロウ",
  "companyName": "株式会社サンプル",
  "corporateNumber": "1234567890123",
  "department": "営業部",
  "position": "課長"
}
```

**Required Fields:**
- `email` (string) - Valid email address, must be unique
- `password` (string) - Minimum 8 characters
- `name` (string) - Full name

**Optional Fields:**
- `nameKana` (string) - Japanese phonetic name
- `companyName` (string) - Company name
- `corporateNumber` (string) - 法人番号 (13 digits)
- `department` (string) - Department name
- `position` (string) - Job title

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "山田太郎",
    "role": "USER"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "error": "Email already exists"
}
```

`500 Internal Server Error`
```json
{
  "error": "Registration failed"
}
```

---

### Login (Sign In)

Authenticate a user and create a session.

**Endpoint:** `POST /api/auth/signin`

**Authentication:** None required

**Note:** Handled by NextAuth's built-in credentials provider.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
Returns NextAuth session with redirect URL.

**Error Responses:**

`401 Unauthorized`
```json
{
  "error": "Invalid credentials"
}
```

---

### Logout (Sign Out)

End the current user session.

**Endpoint:** `POST /api/auth/signout`

**Authentication:** Required (valid session)

**Request Body:** None

**Response (200 OK):**
Redirects to home page after session destruction.

---

### Get Session

Retrieve the current user's session.

**Endpoint:** `GET /api/auth/session`

**Authentication:** Required (valid session)

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "山田太郎",
    "role": "USER"
  },
  "expires": "2025-03-08T12:00:00.000Z"
}
```

**Response (401 Unauthorized):**
```json
{
  "user": null
}
```

---

### Forgot Password

Initiate password reset process (sends reset email).

**Endpoint:** `POST /api/auth/forgot-password`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Note:** Always returns success even if email doesn't exist (security measure to prevent email enumeration).

---

### Reset Password

Complete password reset with token.

**Endpoint:** `POST /api/auth/reset-password`

**Authentication:** None required (requires valid reset token)

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**

`400 Bad Request`
```json
{
  "error": "Invalid or expired token"
}
```

---

## Session Management

### Session Storage
- Sessions stored in Redis for performance
- Session duration: 30 days
- JWT tokens used for stateless authentication

### Session Data Structure
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  }
  expires: string // ISO 8601 date
}
```

---

## Security Features

### Password Requirements
- Minimum 8 characters
- Bcrypt hashing with 10 salt rounds
- No password reset without email verification

### Rate Limiting
Not currently implemented. Recommended for production:
- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- Password reset: 3 per hour per email

### Session Security
- HTTP-only cookies (CSRF protection)
- Secure flag in production (HTTPS only)
- SameSite=Lax
- Session token rotation on privilege escalation

---

## Client Usage Examples

### React Component (Login)

```typescript
import { signIn } from 'next-auth/react'

const handleLogin = async (email: string, password: string) => {
  const result = await signIn('credentials', {
    redirect: false,
    email,
    password
  })

  if (result?.error) {
    console.error('Login failed:', result.error)
  } else {
    router.push('/dashboard')
  }
}
```

### React Component (Register)

```typescript
const handleRegister = async (data: RegisterData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (response.ok) {
    const { user } = await response.json()
    // Auto-login after registration
    await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password
    })
    router.push('/dashboard')
  }
}
```

### Server Component (Get Session)

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <div>Welcome, {session.user.name}!</div>
}
```

---

## Related Documentation

- [Security & RBAC](../architecture/security-rbac.md) - Authorization details
- [User Profile API](./user-profile.md) - User data management

---

**Last Updated:** 2025-02-06
