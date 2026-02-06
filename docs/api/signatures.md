# Signatures API

## Overview

The Signatures API handles the application of digital hankos (seals) to documents. This is the core functionality that creates legally-valid electronic signatures on uploaded documents.

## Base URL

```
/api/signatures
```

## Authentication

All endpoints require authentication via NextAuth session.

## Endpoints

### Apply Signature to Document

Apply a digital hanko to a document at a specific position.

**Endpoint:** `POST /api/signatures`

**Authentication:** Required

**Request Body:**
```json
{
  "documentId": "document-uuid",
  "hankoId": "hanko-uuid",
  "positionX": 450.5,
  "positionY": 680.2,
  "page": 1,
  "approvalId": "approval-uuid"
}
```

**Required Fields:**
- `documentId` (string) - UUID of document to sign
- `hankoId` (string) - UUID of hanko to use
- `positionX` (number) - X coordinate on document (in pixels)
- `positionY` (number) - Y coordinate on document (in pixels)
- `page` (number) - Page number (1-indexed)

**Optional Fields:**
- `approvalId` (string) - If signing as part of approval workflow

**Response (201 Created):**
```json
{
  "signature": {
    "id": "signature-uuid",
    "documentId": "document-uuid",
    "hankoId": "hanko-uuid",
    "userId": "user-uuid",
    "approvalId": "approval-uuid",
    "positionX": 450.5,
    "positionY": 680.2,
    "page": 1,
    "timestamp": "2025-02-06T12:00:00.000Z",
    "ipAddress": "203.0.113.42",
    "userAgent": "Mozilla/5.0...",
    "isValid": true,
    "createdAt": "2025-02-06T12:00:00.000Z",
    "hanko": {
      "name": "実印",
      "type": "JITSUIN",
      "imageUrl": "https://s3.amazonaws.com/bucket/hanko.png"
    },
    "user": {
      "name": "山田太郎",
      "email": "yamada@example.com"
    }
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "error": "Document has already been completed"
}
```

`403 Forbidden` - Permission denied
```json
{
  "error": "You can only use your own hankos"
}
```

`404 Not Found` - Resource not found
```json
{
  "error": "Document or hanko not found"
}
```

---

### Get Document Signatures

Retrieve all signatures applied to a specific document.

**Endpoint:** `GET /api/signatures?documentId=[id]`

**Authentication:** Required (or public access for verification)

**Query Parameters:**
- `documentId` (required) - Document UUID

**Response (200 OK):**
```json
{
  "signatures": [
    {
      "id": "sig-uuid-1",
      "documentId": "document-uuid",
      "positionX": 450.5,
      "positionY": 680.2,
      "page": 1,
      "timestamp": "2025-02-06T10:30:00.000Z",
      "ipAddress": "203.0.113.42",
      "isValid": true,
      "user": {
        "name": "山田太郎",
        "email": "yamada@example.com"
      },
      "hanko": {
        "name": "実印",
        "type": "JITSUIN",
        "imageUrl": "https://s3.amazonaws.com/bucket/hanko1.png"
      }
    },
    {
      "id": "sig-uuid-2",
      "documentId": "document-uuid",
      "positionX": 450.5,
      "positionY": 580.2,
      "page": 1,
      "timestamp": "2025-02-06T11:45:00.000Z",
      "ipAddress": "198.51.100.23",
      "isValid": true,
      "user": {
        "name": "田中次郎",
        "email": "tanaka@example.com"
      },
      "hanko": {
        "name": "認印",
        "type": "MITOMEIN",
        "imageUrl": "https://s3.amazonaws.com/bucket/hanko2.png"
      }
    }
  ],
  "totalSignatures": 2
}
```

---

### Get Signature Details

Retrieve details of a specific signature.

**Endpoint:** `GET /api/signatures/[id]`

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Signature UUID

**Response (200 OK):**
```json
{
  "signature": {
    "id": "signature-uuid",
    "documentId": "document-uuid",
    "hankoId": "hanko-uuid",
    "userId": "user-uuid",
    "approvalId": "approval-uuid",
    "positionX": 450.5,
    "positionY": 680.2,
    "page": 1,
    "timestamp": "2025-02-06T12:00:00.000Z",
    "ipAddress": "203.0.113.42",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "certificateData": {
      "issuer": "Japan PKI Authority",
      "serialNumber": "12345-67890",
      "validFrom": "2025-01-01",
      "validTo": "2026-01-01"
    },
    "isValid": true,
    "createdAt": "2025-02-06T12:00:00.000Z",
    "document": {
      "title": "取引契約書 2025",
      "verificationCode": "ABCD1234EFGH"
    },
    "hanko": {
      "name": "実印",
      "type": "JITSUIN",
      "imageUrl": "https://s3.amazonaws.com/bucket/hanko.png"
    },
    "user": {
      "name": "山田太郎",
      "email": "yamada@example.com",
      "companyName": "株式会社サンプル"
    }
  }
}
```

---

### Verify Signature

Verify the authenticity and validity of a signature (public endpoint).

**Endpoint:** `GET /api/verify/[code]`

**Authentication:** None required (public verification)

**URL Parameters:**
- `code` (string) - Document verification code

**Response (200 OK):**
```json
{
  "document": {
    "id": "document-uuid",
    "title": "取引契約書 2025",
    "fileName": "contract_2025.pdf",
    "status": "COMPLETED",
    "createdAt": "2025-02-06T10:00:00.000Z",
    "completedAt": "2025-02-06T12:00:00.000Z"
  },
  "signatures": [
    {
      "id": "sig-uuid-1",
      "timestamp": "2025-02-06T10:30:00.000Z",
      "isValid": true,
      "signer": "山田太郎",
      "signerCompany": "株式会社サンプル",
      "hankoType": "JITSUIN",
      "hankoName": "実印"
    },
    {
      "id": "sig-uuid-2",
      "timestamp": "2025-02-06T11:45:00.000Z",
      "isValid": true,
      "signer": "田中次郎",
      "signerCompany": "株式会社XYZ",
      "hankoType": "JITSUIN",
      "hankoName": "実印"
    }
  ],
  "verification": {
    "totalSignatures": 2,
    "allValid": true,
    "verifiedAt": "2025-02-06T13:00:00.000Z"
  }
}
```

**Error Responses:**

`404 Not Found`
```json
{
  "error": "Document not found or verification code invalid"
}
```

---

### Invalidate Signature

Mark a signature as invalid (admin only or legal requirement).

**Endpoint:** `DELETE /api/signatures/[id]`

**Authentication:** Required (SUPER_ADMIN only)

**URL Parameters:**
- `id` (string) - Signature UUID

**Request Body:**
```json
{
  "reason": "Signature found to be fraudulent",
  "notes": "Investigation ID: INV-2025-001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "signature": {
    "id": "signature-uuid",
    "isValid": false,
    "invalidatedAt": "2025-02-06T14:00:00.000Z",
    "invalidatedBy": "admin-user-uuid"
  }
}
```

---

## Signature Positioning

### Coordinate System
- **Origin:** Top-left corner of document/page
- **Units:** Pixels
- **X-axis:** Increases to the right
- **Y-axis:** Increases downward

### Example Positions

```
┌─────────────────────────────────────────┐
│ Document (A4 PDF at 72 DPI)             │
│ Width: 595px, Height: 842px              │
│                                           │
│  (100, 100) ──────┐                      │
│                   │                      │
│                   ▼                      │
│                  [印]  Top-left signature│
│                                           │
│                                           │
│                                           │
│                        Bottom-right ──┐   │
│                      [印]  (450, 680)─┘  │
└─────────────────────────────────────────┘
```

### Recommended Positions
- **Contracts:** Bottom-right of each signature section
- **Receipts:** Next to signature line
- **Reports:** Top-right or bottom-right
- **Forms:** Adjacent to signer's printed name

### Visual Guidelines
- Allow 80x80px space for hanko image
- Maintain 20px margin from page edges
- Vertical alignment for multiple signers
- Consider page orientation (portrait/landscape)

---

## Signature Workflow Integration

### Sequential Signing
When a document has an approval workflow:

1. First approver signs → `Approval.status = APPROVED`
2. Workflow advances to next step
3. Second approver notified
4. Second approver signs
5. Process continues until all approvals complete
6. Document status → `COMPLETED`

### Parallel Signing
Multiple signers can sign simultaneously:
- No approval workflow required
- All signers have equal authority
- Document completes when target signature count reached

---

## Legal Compliance

### Recorded Information
Each signature records:
- **Timestamp:** ISO 8601 format with timezone
- **IP Address:** For forensic tracking
- **User Agent:** Browser/device information
- **Certificate Data:** PKI certificate details (if available)
- **Hanko Details:** Type, registration status

### Electronic Signature Act (電子署名法)
- Signatures meet requirements for legal validity
- Timestamping provided
- Signer identity verified through authentication
- Non-repudiation through audit trail

### Data Retention
- Signatures stored permanently (cannot be deleted)
- Invalidation marks signature as invalid but preserves record
- Audit logs maintained for 10 years (recommended)

---

## Client Usage Examples

### React Component (Apply Signature)

```typescript
const applySignature = async (
  documentId: string,
  hankoId: string,
  position: { x: number; y: number; page: number }
) => {
  const response = await fetch('/api/signatures', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId,
      hankoId,
      positionX: position.x,
      positionY: position.y,
      page: position.page
    })
  })

  if (response.ok) {
    const { signature } = await response.json()
    console.log('Signature applied:', signature.id)
    router.push(`/dashboard/documents/${documentId}`)
  } else {
    const error = await response.json()
    alert(error.error)
  }
}
```

### React Component (Display Signatures)

```typescript
const [signatures, setSignatures] = useState([])

useEffect(() => {
  const fetchSignatures = async () => {
    const response = await fetch(`/api/signatures?documentId=${documentId}`)
    const data = await response.json()
    setSignatures(data.signatures)
  }
  fetchSignatures()
}, [documentId])

return (
  <div>
    {signatures.map(sig => (
      <div key={sig.id}>
        <img src={sig.hanko.imageUrl} alt={sig.hanko.name} />
        <p>{sig.user.name} - {new Date(sig.timestamp).toLocaleString('ja-JP')}</p>
      </div>
    ))}
  </div>
)
```

---

## Performance Considerations

### Signature Application
- Asynchronous processing recommended for large documents
- Generate thumbnail of signed document for preview
- Cache signed document PDFs in S3

### Verification
- Verification endpoint optimized for public access
- No authentication required
- Rate limiting applied (100 requests/minute/IP)

---

## Audit Logging

All signature operations logged:

**APPLY_SIGNATURE:**
```json
{
  "action": "APPLY_SIGNATURE",
  "entityType": "Signature",
  "entityId": "sig-uuid",
  "details": {
    "documentId": "doc-uuid",
    "hankoType": "JITSUIN",
    "page": 1
  }
}
```

**VERIFY_SIGNATURE:**
```json
{
  "action": "VERIFY_SIGNATURE",
  "entityType": "Document",
  "entityId": "doc-uuid",
  "details": {
    "verificationCode": "ABCD1234EFGH",
    "publicAccess": true
  }
}
```

---

## Related Documentation

- [Documents API](./documents.md) - Document management
- [Hankos API](./hankos.md) - Digital hanko management
- [Security](../architecture/security-rbac.md) - Security implementation
- [Glossary](../reference/glossary.md) - Japanese business terms

---

**Last Updated:** 2025-02-06
