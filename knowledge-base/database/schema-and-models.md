# Schema & Models

## What It Is

The Prisma schema (`prisma/schema.prisma`) defines all database tables, columns, relationships, enums, and indexes. It serves as the single source of truth for the data layer.

## How It Works Here

### Data Model Overview

```
User ─────┬──── Hanko (1:many)
           │         │
           │         └──── Signature (1:many)
           │                    │
           ├──── Document (1:many) ◄──┘
           │         │
           │         ├──── Workflow (1:1)
           │         │         │
           │         └──── Approval (1:many) ◄┘
           │                    │
           └──── Approval (1:many, as approver)

AuditLog (standalone, references entities by ID)
```

### User Model

```prisma
model User {
  id              String      @id @default(uuid())
  email           String      @unique
  name            String
  nameKana        String?     // Japanese phonetic name (for sorting: あ→わ)
  password        String      // bcrypt hash
  companyName     String?
  corporateNumber String?     // 法人番号 (corporate number, 13 digits)
  department      String?
  position        String?
  role            Role        @default(USER)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  hankos          Hanko[]
  documents       Document[]
  signatures      Signature[]
  approvals       Approval[]

  @@map("users")              // table name in PostgreSQL
}
```

**Design decisions:**
- UUID primary keys for security (not sequential IDs)
- `nameKana` enables Japanese phonetic sorting (五十音順)
- `corporateNumber` for Japanese corporate identification
- `@@map("users")` uses lowercase plural for table name

### Hanko Model

```prisma
model Hanko {
  id                  String      @id @default(uuid())
  userId              String
  name                String      // Display name (e.g., "田中太郎の認印")
  type                HankoType   // MITOMEIN | GINKOIN | JITSUIN
  imageUrl            String      // S3 URL for the hanko image
  imageData           String      @db.Text  // Base64 for quick display
  font                String?     // Font used (篆書体, etc.)
  size                Int         @default(60)  // pixels
  isRegistered        Boolean     @default(false)  // jitsuin registered?
  registrationNumber  String?     // Municipal registration number
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  user                User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  signatures          Signature[]

  @@index([userId])               // for querying user's hankos
  @@map("hankos")
}
```

**Design decisions:**
- `imageData` stored as Text (base64) for immediate display without S3 fetch
- `imageUrl` is the canonical S3 location
- Three hanko types match Japanese legal categories
- `isRegistered` + `registrationNumber` for 実印 (registered seals)

### Document Model

```prisma
model Document {
  id                String          @id @default(uuid())
  title             String
  description       String?
  fileUrl           String          // S3 file path
  fileName          String          // Original filename
  fileSize          Int             // Bytes
  mimeType          String          // application/pdf, etc.
  status            DocumentStatus  @default(DRAFT)
  createdById       String
  verificationCode  String          @unique  // XXXX-XXXX-XXXX format
  qrCodeUrl         String?
  templateType      String?         // 契約書, 請求書, 申請書, etc.
  metadata          Json?           // Flexible key-value data
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  completedAt       DateTime?       // When all approvals completed

  createdBy         User            @relation(fields: [createdById], references: [id])
  signatures        Signature[]
  approvals         Approval[]
  workflow          Workflow?       // Optional approval workflow

  @@index([createdById])
  @@index([status])
  @@index([verificationCode])
  @@map("documents")
}
```

**Design decisions:**
- Unique `verificationCode` for public document verification
- `metadata` as JSON for flexible, schema-less data (amounts, categories, custom fields)
- Triple indexing for common query patterns
- `templateType` for Japanese document categories

### Workflow Model

```prisma
model Workflow {
  id              String      @id @default(uuid())
  documentId      String      @unique    // One workflow per document
  name            String
  currentStep     Int         @default(0)
  totalSteps      Int
  isSequential    Boolean     @default(true)  // vs parallel approval
  configuration   Json        // Full workflow definition
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  document        Document    @relation(fields: [documentId], references: [id], onDelete: Cascade)
  approvals       Approval[]

  @@map("workflows")
}
```

**Design decisions:**
- 1:1 with Document (each document has at most one workflow)
- `isSequential` supports both sequential and parallel approval patterns
- `configuration` stores the full step definitions as JSON:
  ```json
  {
    "steps": [
      { "order": 0, "approverId": "uuid", "role": "部長承認" },
      { "order": 1, "approverId": "uuid", "role": "最終承認" }
    ]
  }
  ```

### Approval Model

```prisma
model Approval {
  id              String          @id @default(uuid())
  workflowId      String
  documentId      String
  approverId      String
  order           Int             // Position in approval chain
  status          ApprovalStatus  @default(PENDING)
  dueDate         DateTime?
  completedAt     DateTime?
  comment         String?         // Rejection reason
  isProxy         Boolean         @default(false)  // 代理承認
  proxyFor        String?         // Original approver ID
  notifiedAt      DateTime?
  reminderSentAt  DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  workflow        Workflow        @relation(...)
  document        Document        @relation(...)
  approver        User            @relation(...)
  signature       Signature?      // Linked signature when approved

  @@index([workflowId])
  @@index([approverId])
  @@index([status])
  @@map("approvals")
}
```

**Design decisions:**
- `isProxy` + `proxyFor` enables Japanese 代理 (proxy/delegate) approval
- Triple indexing on foreign keys and status for efficient queries
- `comment` stores rejection reasons
- `dueDate` enables deadline tracking

### Signature Model

```prisma
model Signature {
  id              String      @id @default(uuid())
  documentId      String
  hankoId         String
  userId          String
  approvalId      String?     @unique  // Optional link to approval
  positionX       Float       // X coordinate on document
  positionY       Float       // Y coordinate on document
  page            Int         @default(1)
  timestamp       DateTime    @default(now())
  ipAddress       String?     // Legal audit trail
  userAgent       String?     // Legal audit trail
  certificateData Json?       // PKI certificate (future)
  isValid         Boolean     @default(true)
  createdAt       DateTime    @default(now())

  document        Document    @relation(...)
  hanko           Hanko       @relation(...)
  user            User        @relation(...)
  approval        Approval?   @relation(...)

  @@index([documentId])
  @@index([userId])
  @@map("signatures")
}
```

**Design decisions:**
- Position data (X, Y, page) for rendering signatures on documents
- `ipAddress` and `userAgent` for legal compliance audit trail
- `certificateData` placeholder for future PKI integration
- 1:1 optional link to Approval (signature can exist without workflow)

### AuditLog Model

```prisma
model AuditLog {
  id              String      @id @default(uuid())
  userId          String?     // Nullable for system actions
  action          String      // DOCUMENT_CREATED, SIGNATURE_APPLIED, etc.
  entityType      String      // Document, Hanko, Signature
  entityId        String
  details         Json?       // Additional context
  ipAddress       String?
  userAgent       String?
  timestamp       DateTime    @default(now())

  @@index([entityId])
  @@index([timestamp])
  @@map("audit_logs")
}
```

**Design decisions:**
- Standalone model (no foreign keys) for resilience - logs survive entity deletion
- `entityType` + `entityId` for polymorphic association
- Indexed by timestamp for 7-year legal retention queries (電子帳簿保存法)

### Enums

```prisma
enum Role {
  USER          // Standard user
  ADMIN         // Organization admin
  SUPER_ADMIN   // System administrator
}

enum HankoType {
  MITOMEIN      // 認印 - Acknowledgment seal (everyday use)
  GINKOIN       // 銀行印 - Bank seal (financial transactions)
  JITSUIN       // 実印 - Registered seal (legal documents)
}

enum DocumentStatus {
  DRAFT         // Created, not yet submitted
  PENDING       // Submitted, awaiting first approval
  IN_PROGRESS   // At least one signature/approval
  COMPLETED     // All approvals done
  REJECTED      // An approver rejected
  ARCHIVED      // Completed and archived
}

enum ApprovalStatus {
  PENDING       // Waiting for approver action
  APPROVED      // Approved by approver
  REJECTED      // Rejected by approver
  SKIPPED       // Bypassed (admin override)
}
```

## Cascade Behavior

| Parent | Child | On Delete |
|--------|-------|-----------|
| User | Hanko | Cascade (delete user's hankos) |
| Document | Workflow | Cascade (delete workflow with document) |
| Document | Signature | Cascade |
| Workflow | Approval | Cascade |
| Document | Approval | Cascade |
| User | Document | No cascade (preserve documents) |

## Key Files

- `prisma/schema.prisma` - All model definitions
- `prisma/migrations/20260206000449_init/` - Initial migration SQL

## Resources

- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Prisma Indexes](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes)
