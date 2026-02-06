# Database Schema Documentation

## Overview

HankoSign Digital uses PostgreSQL as its primary relational database, accessed through Prisma ORM. The schema is designed to support digital hanko management, document workflow, electronic signatures, and approval processes.

## Entity Relationship Diagram

```
User (1) ──┬── (N) Hanko
           ├── (N) Document
           ├── (N) Signature
           └── (N) Approval

Document (1) ──┬── (N) Signature
               ├── (1) Workflow
               └── (N) Approval

Workflow (1) ──── (N) Approval

Approval (1) ──── (1) Signature [optional]

Hanko (1) ──── (N) Signature
```

## Core Entities

### User

Represents system users with authentication and profile information.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | UUID primary key | PK, UUID |
| email | String | User email address | Unique, Required |
| name | String | Full name | Required |
| nameKana | String | Japanese phonetic name (カナ) | Optional |
| password | String | Bcrypt hashed password | Required |
| companyName | String | Company/organization name | Optional |
| corporateNumber | String | 法人番号 (Corporate Number) | Optional |
| department | String | Department within company | Optional |
| position | String | Job title/position | Optional |
| role | Role | User role (USER, ADMIN, SUPER_ADMIN) | Default: USER |
| createdAt | DateTime | Account creation timestamp | Auto |
| updatedAt | DateTime | Last update timestamp | Auto |

**Relations:**
- `hankos` - User's digital hankos (1:N)
- `documents` - Documents created by user (1:N)
- `signatures` - Signatures applied by user (1:N)
- `approvals` - Approval tasks assigned to user (1:N)

**Indexes:**
- Primary key on `id`
- Unique constraint on `email`

---

### Hanko

Represents a digital seal/stamp (判子) owned by a user.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | UUID primary key | PK, UUID |
| userId | String | Owner user ID | FK → User.id |
| name | String | Hanko label/name | Required |
| type | HankoType | Seal type (MITOMEIN, GINKOIN, JITSUIN) | Enum, Required |
| imageUrl | String | S3 URL to hanko image | Required |
| imageData | String | Base64 encoded image data | Text, Required |
| font | String | Font type (篆書体, etc.) | Optional |
| size | Int | Size in pixels | Default: 60 |
| isRegistered | Boolean | Jitsuin registration status | Default: false |
| registrationNumber | String | Municipal registration number | Optional |
| createdAt | DateTime | Creation timestamp | Auto |
| updatedAt | DateTime | Last update timestamp | Auto |

**Relations:**
- `user` - Owner (N:1)
- `signatures` - Signatures using this hanko (1:N)

**Indexes:**
- Primary key on `id`
- Index on `userId`

**On Delete:** CASCADE (deletes hanko when user is deleted)

---

### Document

Represents an uploaded document ready for signing.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | UUID primary key | PK, UUID |
| title | String | Document title | Required |
| description | String | Document description | Optional |
| fileUrl | String | S3 URL to file | Required |
| fileName | String | Original file name | Required |
| fileSize | Int | File size in bytes | Required |
| mimeType | String | MIME type (application/pdf, etc.) | Required |
| status | DocumentStatus | Current status | Enum, Default: DRAFT |
| createdById | String | Creator user ID | FK → User.id |
| verificationCode | String | Public verification code | Unique, Required |
| qrCodeUrl | String | QR code image URL | Optional |
| templateType | String | Document type (契約書, 請求書, etc.) | Optional |
| metadata | Json | Additional metadata | JSON, Optional |
| createdAt | DateTime | Creation timestamp | Auto |
| updatedAt | DateTime | Last update timestamp | Auto |
| completedAt | DateTime | Completion timestamp | Optional |

**Relations:**
- `createdBy` - Creator user (N:1)
- `signatures` - Applied signatures (1:N)
- `approvals` - Approval tasks (1:N)
- `workflow` - Associated workflow (1:1, optional)

**Indexes:**
- Primary key on `id`
- Index on `createdById`
- Index on `status`
- Unique index on `verificationCode`

**Status Flow:**
```
DRAFT → PENDING → IN_PROGRESS → COMPLETED
                               ↘ REJECTED → ARCHIVED
```

---

### Workflow

Represents an approval workflow (稟議 ringi) for a document.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | UUID primary key | PK, UUID |
| documentId | String | Associated document ID | FK → Document.id, Unique |
| name | String | Workflow name | Required |
| currentStep | Int | Current step number | Default: 0 |
| totalSteps | Int | Total number of steps | Required |
| isSequential | Boolean | Sequential vs parallel approval | Default: true |
| configuration | Json | Workflow configuration data | JSON, Required |
| createdAt | DateTime | Creation timestamp | Auto |
| updatedAt | DateTime | Last update timestamp | Auto |

**Relations:**
- `document` - Associated document (1:1)
- `approvals` - Approval steps (1:N)

**Indexes:**
- Primary key on `id`
- Unique constraint on `documentId`

**On Delete:** CASCADE (deletes workflow when document is deleted)

---

### Approval

Represents a single approval step within a workflow.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | UUID primary key | PK, UUID |
| workflowId | String | Parent workflow ID | FK → Workflow.id |
| documentId | String | Associated document ID | FK → Document.id |
| approverId | String | Assigned approver user ID | FK → User.id |
| order | Int | Order in approval chain | Required |
| status | ApprovalStatus | Current status | Enum, Default: PENDING |
| dueDate | DateTime | Approval deadline | Optional |
| completedAt | DateTime | Completion timestamp | Optional |
| comment | String | Approver comment | Optional |
| isProxy | Boolean | Proxy approval flag (代理) | Default: false |
| proxyFor | String | Original approver if proxy | Optional |
| notifiedAt | DateTime | Notification sent timestamp | Optional |
| reminderSentAt | DateTime | Reminder sent timestamp | Optional |
| createdAt | DateTime | Creation timestamp | Auto |
| updatedAt | DateTime | Last update timestamp | Auto |

**Relations:**
- `workflow` - Parent workflow (N:1)
- `document` - Associated document (N:1)
- `approver` - Assigned user (N:1)
- `signature` - Applied signature (1:1, optional)

**Indexes:**
- Primary key on `id`
- Index on `workflowId`
- Index on `approverId`
- Index on `status`

**On Delete:** CASCADE (deletes approval when workflow or document is deleted)

**Status Flow:**
```
PENDING → APPROVED
        ↘ REJECTED
        ↘ SKIPPED
```

---

### Signature

Represents an applied digital signature (hanko impression) on a document.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | UUID primary key | PK, UUID |
| documentId | String | Signed document ID | FK → Document.id |
| hankoId | String | Used hanko ID | FK → Hanko.id |
| userId | String | Signer user ID | FK → User.id |
| approvalId | String | Associated approval ID | FK → Approval.id, Unique, Optional |
| positionX | Float | X coordinate on document | Required |
| positionY | Float | Y coordinate on document | Required |
| page | Int | Page number | Default: 1 |
| timestamp | DateTime | Signing timestamp | Auto |
| ipAddress | String | Signer IP address | Optional |
| userAgent | String | Signer browser user agent | Optional |
| certificateData | Json | PKI certificate information | JSON, Optional |
| isValid | Boolean | Signature validity flag | Default: true |
| createdAt | DateTime | Creation timestamp | Auto |

**Relations:**
- `document` - Signed document (N:1)
- `hanko` - Used hanko (N:1)
- `user` - Signer (N:1)
- `approval` - Related approval (1:1, optional)

**Indexes:**
- Primary key on `id`
- Index on `documentId`
- Index on `userId`

**On Delete:** CASCADE (deletes signature when document is deleted)

---

### AuditLog

Tracks all critical system operations for compliance and forensics.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | UUID primary key | PK, UUID |
| userId | String | Acting user ID | Optional |
| action | String | Action performed | Required |
| entityType | String | Entity type (Document, Hanko, etc.) | Required |
| entityId | String | Affected entity ID | Required |
| details | Json | Additional action details | JSON, Optional |
| ipAddress | String | Request IP address | Optional |
| userAgent | String | Request user agent | Optional |
| timestamp | DateTime | Action timestamp | Auto |

**Indexes:**
- Primary key on `id`
- Index on `entityId`
- Index on `timestamp`

**No Relations** - Intentionally decoupled for data retention

**Common Actions:**
- `CREATE_HANKO`, `DELETE_HANKO`
- `UPLOAD_DOCUMENT`, `DELETE_DOCUMENT`
- `APPLY_SIGNATURE`
- `ROLE_CHANGE`, `PASSWORD_CHANGE`
- `LOGIN`, `LOGOUT`

---

## Enums

### Role

User role for RBAC system.

**Values:**
- `USER` - Standard user
- `ADMIN` - Administrator
- `SUPER_ADMIN` - Super administrator

### HankoType

Type of Japanese seal.

**Values:**
- `MITOMEIN` (認印) - Acknowledgment seal (casual use)
- `GINKOIN` (銀行印) - Bank seal (financial transactions)
- `JITSUIN` (実印) - Registered seal (legal contracts)

### DocumentStatus

Document lifecycle status.

**Values:**
- `DRAFT` - Initial state, not yet submitted
- `PENDING` - Awaiting approval/signature
- `IN_PROGRESS` - Currently being processed
- `COMPLETED` - All signatures/approvals complete
- `REJECTED` - Rejected during approval
- `ARCHIVED` - Archived for record-keeping

### ApprovalStatus

Approval step status.

**Values:**
- `PENDING` - Awaiting approver action
- `APPROVED` - Approved by approver
- `REJECTED` - Rejected by approver
- `SKIPPED` - Skipped (e.g., conditional approval)

---

## Cascade Behaviors

### User Deletion
- **Deletes:** All owned hankos
- **Keeps:** Documents (transferred to system), signatures remain for audit

### Document Deletion
- **Deletes:** Associated workflow, approvals, signatures
- **Rationale:** Complete removal of document data

### Workflow Deletion
- **Deletes:** All approval steps
- **Automatic:** When document is deleted

---

## Database Migrations

Migrations are managed through Prisma Migrate.

**Common Commands:**

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

**Migration Files Location:** `/prisma/migrations/`

---

## Performance Considerations

### Indexing Strategy
- **User queries:** Indexed on email (unique) for login
- **Document queries:** Indexed on status, creator, verification code
- **Signature queries:** Indexed on document ID (frequent joins)
- **Audit queries:** Indexed on timestamp (time-range queries)

### Query Optimization
- Use Prisma's `select` to fetch only needed fields
- Leverage `include` for efficient joins
- Implement pagination for list views
- Consider Redis caching for frequently accessed data

### Data Growth Projections
- **Documents:** ~1KB metadata per document
- **Signatures:** ~500B per signature
- **Audit Logs:** ~300B per log entry
- **Images:** Stored in S3, not in database

---

## Data Integrity

### Referential Integrity
- Foreign keys enforce relationships
- CASCADE deletes prevent orphaned records
- Unique constraints prevent duplicates

### Validation
- Prisma schema validation at ORM level
- Application-level validation with Zod
- Database constraints as final safety net

---

## Backup & Recovery

### Backup Strategy (Production)
- **Full backup:** Daily
- **Incremental backup:** Hourly
- **Retention:** 30 days
- **Testing:** Monthly restore tests

### S3 File Backup
- Versioning enabled
- Cross-region replication (recommended)
- Lifecycle policies for archival

---

## Related Documentation

- [Architecture Overview](./overview.md) - System architecture
- [Security & RBAC](./security-rbac.md) - Security implementation
- [API Reference](../api/) - API endpoints using this schema

---

**Schema Location:** `/prisma/schema.prisma`
**Last Updated:** 2025-02-06
**Version:** 0.1.0
