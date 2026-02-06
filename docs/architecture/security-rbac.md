# Role-Based Access Control (RBAC) Documentation

## Overview

HankoSign Digital implements a comprehensive role-based access control system with three user roles:
- **USER**: Standard users with basic document and hanko management capabilities
- **ADMIN**: Administrative users with additional user and organization management capabilities
- **SUPER_ADMIN**: Super administrators with full system access

## Protection Layers

### 1. Proxy Protection (Server-Side)

**File**: `/proxy.ts`

The proxy provides the first layer of protection by:
- Handling i18n routing with next-intl middleware
- Redirecting unauthenticated users trying to access dashboard routes to the login page
- Redirecting non-admin users trying to access `/dashboard/roles` to the main dashboard
- Running before all routes (except API, static files, and Next.js internals)

```typescript
// Protected routes:
- /dashboard/** (requires authentication)
- /dashboard/roles (requires ADMIN or SUPER_ADMIN role)
```

### 2. API Route Protection

All API routes implement authentication and ownership checks:

#### User Profile & Settings APIs
**Files**:
- `/app/api/user/profile/route.ts`
- `/app/api/user/company/route.ts`
- `/app/api/user/password/route.ts`

**Protection**:
- ✅ Requires authentication
- ✅ Users can only update their own profile
- ✅ Audit logs created for all changes
- ✅ Email uniqueness validation
- ✅ Password verification before change

#### Admin APIs
**Files**:
- `/app/api/admin/users/route.ts`
- `/app/api/admin/users/[id]/role/route.ts`

**Protection**:
- ✅ Requires ADMIN or SUPER_ADMIN role
- ✅ Only SUPER_ADMIN can assign SUPER_ADMIN role
- ✅ Users cannot change their own role
- ✅ Audit logs for all role changes

#### Resource APIs (Hankos, Documents, Signatures)
**Files**:
- `/app/api/hankos/route.ts`
- `/app/api/documents/route.ts`
- `/app/api/signatures/route.ts`

**Protection**:
- ✅ Requires authentication
- ✅ Users can only access/modify their own resources
- ✅ Ownership verification on DELETE operations
- ✅ Document status validation (e.g., can't sign completed documents)

### 3. UI Protection (Client-Side)

#### Dashboard Layout
**File**: `/app/[locale]/dashboard/layout.tsx`

**Protection**:
- ✅ Redirects to login if session expires
- ✅ Role Management menu only visible to ADMIN/SUPER_ADMIN
- ✅ Loading state while checking authentication

#### Roles Page
**File**: `/app/[locale]/dashboard/roles/page.tsx`

**Protection**:
- ✅ Client-side redirect if not ADMIN/SUPER_ADMIN
- ✅ SUPER_ADMIN dropdown only visible to SUPER_ADMIN
- ✅ Users cannot change their own role (dropdown disabled)

## Role Permissions Matrix

| Permission | USER | ADMIN | SUPER_ADMIN |
|-----------|------|-------|-------------|
| Create Hankos | ✅ | ✅ | ✅ |
| Upload Documents | ✅ | ✅ | ✅ |
| Sign Documents | ✅ | ✅ | ✅ |
| Approval Workflow | ✅ | ✅ | ✅ |
| Manage User Roles | ❌ | ✅ | ✅ |
| Manage Organization | ❌ | ✅ | ✅ |
| View Reports | ❌ | ✅ | ✅ |
| Assign Super Admin | ❌ | ❌ | ✅ |
| Manage System Settings | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ |

## Helper Functions

**File**: `/lib/permissions.ts`

Provides reusable permission checking functions:

```typescript
// Get all permissions for a role
getRolePermissions(role: UserRole): Permission

// Check if user has admin access
hasAdminAccess(role: UserRole): boolean

// Check if user has super admin access
hasSuperAdminAccess(role: UserRole): boolean

// Server-side authentication helpers
requireAuth(): Promise<Session>
requireAdmin(): Promise<Session>
requireSuperAdmin(): Promise<Session>
```

## Security Best Practices

1. **Defense in Depth**: Multiple layers of protection (middleware, API, UI)
2. **Ownership Verification**: All resource operations verify ownership
3. **Audit Logging**: Critical operations logged with user details
4. **Session Security**: JWT with 30-day expiration
5. **Password Security**: bcrypt hashing with salt rounds
6. **Role Validation**: Server-side role checks on all protected endpoints
7. **Input Validation**: Zod schemas for all API inputs

## Testing Role Access

### Test Credentials

```
Super Admin:
- Email: admin@hankosign.jp
- Password: Admin@123456

Admin:
- Email: manager@hankosign.jp
- Password: Manager@123456

User:
- Email: user@hankosign.jp
- Password: User@123456
```

### Access Testing Checklist

- [ ] Non-authenticated users redirected to login
- [ ] USER cannot access /dashboard/roles
- [ ] ADMIN can access /dashboard/roles
- [ ] ADMIN cannot assign SUPER_ADMIN role
- [ ] SUPER_ADMIN can assign all roles
- [ ] Users cannot change their own role
- [ ] Users can only see/edit their own hankos and documents
- [ ] API returns 401 for unauthenticated requests
- [ ] API returns 403 for unauthorized role access

## Future Enhancements

- [ ] Organization-level permissions
- [ ] Custom role creation
- [ ] Fine-grained permission assignment
- [ ] Two-factor authentication for admins
- [ ] Session timeout warning
- [ ] IP-based access restrictions
- [ ] Audit log viewing interface for SUPER_ADMIN
