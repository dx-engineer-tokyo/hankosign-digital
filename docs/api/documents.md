# Documents API

## Overview

The Documents API manages document uploads, retrieval, and lifecycle. Documents can be PDFs, Word files, or images that require digital signatures.

## Base URL

```
/api/documents
```

## Authentication

All endpoints require authentication via NextAuth session.

## Endpoints

### List User's Documents

Retrieve all documents created by or shared with the authenticated user.

**Endpoint:** `GET /api/documents`

**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by status: `DRAFT`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`, `ARCHIVED`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "documents": [
    {
      "id": "uuid-string",
      "title": "取引契約書 2025",
      "description": "株式会社XYZとの取引契約",
      "fileUrl": "https://s3.amazonaws.com/bucket/documents/uuid.pdf",
      "fileName": "contract_2025.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "status": "IN_PROGRESS",
      "verificationCode": "ABCD1234EFGH",
      "qrCodeUrl": "https://s3.amazonaws.com/bucket/qr/uuid.png",
      "templateType": "契約書",
      "metadata": {
        "contractValue": 1000000,
        "expiryDate": "2025-12-31"
      },
      "createdAt": "2025-02-06T10:00:00.000Z",
      "updatedAt": "2025-02-06T11:30:00.000Z",
      "completedAt": null,
      "createdBy": {
        "id": "user-uuid",
        "name": "山田太郎",
        "email": "yamada@example.com"
      },
      "signatures": [
        {
          "id": "sig-uuid",
          "userId": "user-uuid",
          "timestamp": "2025-02-06T11:15:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### Get Single Document

Retrieve details of a specific document.

**Endpoint:** `GET /api/documents/[id]`

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Document UUID

**Response (200 OK):**
```json
{
  "document": {
    "id": "uuid-string",
    "title": "取引契約書 2025",
    "description": "株式会社XYZとの取引契約",
    "fileUrl": "https://s3.amazonaws.com/bucket/documents/uuid.pdf",
    "fileName": "contract_2025.pdf",
    "fileSize": 524288,
    "mimeType": "application/pdf",
    "status": "IN_PROGRESS",
    "verificationCode": "ABCD1234EFGH",
    "qrCodeUrl": "https://s3.amazonaws.com/bucket/qr/uuid.png",
    "templateType": "契約書",
    "metadata": {},
    "createdAt": "2025-02-06T10:00:00.000Z",
    "updatedAt": "2025-02-06T11:30:00.000Z",
    "completedAt": null,
    "createdBy": {
      "id": "user-uuid",
      "name": "山田太郎",
      "email": "yamada@example.com"
    },
    "signatures": [
      {
        "id": "sig-uuid",
        "user": {
          "name": "山田太郎"
        },
        "hanko": {
          "name": "実印",
          "type": "JITSUIN"
        },
        "positionX": 450,
        "positionY": 680,
        "page": 1,
        "timestamp": "2025-02-06T11:15:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

`403 Forbidden` - User doesn't have access to this document
```json
{
  "error": "Forbidden: You can only access your own documents"
}
```

`404 Not Found`
```json
{
  "error": "Document not found"
}
```

---

### Upload Document

Upload a new document for signing.

**Endpoint:** `POST /api/documents`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file) - Document file (PDF, DOCX, PNG, JPG)
- `title` (string) - Document title
- `description` (string, optional) - Description
- `templateType` (string, optional) - Document type (契約書, 請求書, 見積書, etc.)
- `metadata` (JSON string, optional) - Additional metadata

**Example using FormData:**
```typescript
const formData = new FormData()
formData.append('file', fileObject)
formData.append('title', '取引契約書 2025')
formData.append('description', '株式会社XYZとの取引契約')
formData.append('templateType', '契約書')
formData.append('metadata', JSON.stringify({ contractValue: 1000000 }))
```

**Response (201 Created):**
```json
{
  "document": {
    "id": "uuid-string",
    "title": "取引契約書 2025",
    "fileUrl": "https://s3.amazonaws.com/bucket/documents/uuid.pdf",
    "fileName": "contract_2025.pdf",
    "fileSize": 524288,
    "mimeType": "application/pdf",
    "status": "DRAFT",
    "verificationCode": "ABCD1234EFGH",
    "qrCodeUrl": "https://s3.amazonaws.com/bucket/qr/uuid.png",
    "createdAt": "2025-02-06T10:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Invalid file or missing required fields
```json
{
  "error": "File is required"
}
```

`413 Payload Too Large` - File exceeds size limit
```json
{
  "error": "File size exceeds 10MB limit"
}
```

`415 Unsupported Media Type` - Invalid file type
```json
{
  "error": "Unsupported file type. Allowed: PDF, DOCX, PNG, JPG"
}
```

---

### Update Document Status

Update document status or metadata.

**Endpoint:** `PATCH /api/documents/[id]`

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Document UUID

**Request Body:**
```json
{
  "status": "COMPLETED",
  "metadata": {
    "reviewedBy": "田中次郎",
    "reviewDate": "2025-02-06"
  }
}
```

**Allowed Status Transitions:**
- `DRAFT` → `PENDING`
- `PENDING` → `IN_PROGRESS` or `REJECTED`
- `IN_PROGRESS` → `COMPLETED` or `REJECTED`
- Any status → `ARCHIVED`

**Response (200 OK):**
```json
{
  "document": {
    "id": "uuid-string",
    "status": "COMPLETED",
    "updatedAt": "2025-02-06T12:00:00.000Z",
    "completedAt": "2025-02-06T12:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Invalid status transition
```json
{
  "error": "Cannot transition from IN_PROGRESS to DRAFT"
}
```

---

### Delete Document

Delete a document and all associated data.

**Endpoint:** `DELETE /api/documents/[id]`

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Document UUID

**Query Parameters:**
- `force` (optional) - Force delete even if signed (default: false)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Error Responses:**

`400 Bad Request` - Document has signatures
```json
{
  "error": "Cannot delete document with signatures. Use ?force=true to override."
}
```

`403 Forbidden` - User doesn't own this document
```json
{
  "error": "Forbidden: You can only delete your own documents"
}
```

---

### Download Document

Get a presigned URL to download the document file.

**Endpoint:** `GET /api/documents/[id]/download`

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Document UUID

**Response (200 OK):**
```json
{
  "downloadUrl": "https://s3.amazonaws.com/bucket/documents/uuid.pdf?X-Amz-Signature=...",
  "expiresIn": 3600
}
```

**Note:** The presigned URL expires in 1 hour (3600 seconds).

---

## File Requirements

### Supported Formats
- **PDF:** `.pdf` (Recommended)
- **Word:** `.doc`, `.docx`
- **Images:** `.png`, `.jpg`, `.jpeg`

### File Size Limits
- Maximum: 10MB
- Recommended: < 5MB

### Document Guidelines
- Clear, high-resolution scans
- Proper orientation
- No password protection
- Single document per file

---

## Document Status Lifecycle

```
DRAFT
  ↓
PENDING (awaiting signatures/approvals)
  ↓
IN_PROGRESS (signatures being applied)
  ↓
COMPLETED (all signatures complete)

From any status:
  ↓
ARCHIVED (archived for records)

Alternative flow:
PENDING/IN_PROGRESS
  ↓
REJECTED (approval denied)
```

---

## Verification System

### Verification Code
- Automatically generated unique code (12 characters)
- Format: `XXXX-XXXX-XXXX` (alphanumeric)
- Used for public verification at `/verify/[code]`

### QR Code
- Generated automatically on document upload
- Links to public verification page
- Stored in S3
- Can be printed on document

---

## Template Types

Common Japanese business documents:

| Type | Japanese | Use Case |
|------|----------|----------|
| Contract | 契約書 | Business agreements |
| Invoice | 請求書 | Payment requests |
| Quote | 見積書 | Price quotations |
| Receipt | 領収書 | Payment receipts |
| Proposal | 稟議書 | Internal approvals |
| Report | 報告書 | Status reports |
| Agreement | 合意書 | Mutual agreements |
| Order | 発注書 | Purchase orders |

---

## Client Usage Examples

### React Component (Upload Document)

```typescript
const uploadDocument = async (file: File, title: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)
  formData.append('templateType', '契約書')

  const response = await fetch('/api/documents', {
    method: 'POST',
    body: formData
  })

  if (response.ok) {
    const { document } = await response.json()
    router.push(`/dashboard/documents/${document.id}`)
  }
}
```

### React Component (List Documents)

```typescript
const [documents, setDocuments] = useState([])

useEffect(() => {
  const fetchDocuments = async () => {
    const response = await fetch('/api/documents?status=IN_PROGRESS')
    const data = await response.json()
    setDocuments(data.documents)
  }
  fetchDocuments()
}, [])
```

---

## Permissions

### Ownership Rules
- Users can only view/edit/delete their own documents
- Document creator is tracked in `createdById` field
- Shared documents (future feature) will have separate access control

### Status Update Rules
- Only document owner can update status
- Certain transitions require signatures (enforced at application level)

---

## Audit Logging

Document operations logged in `AuditLog`:

**UPLOAD_DOCUMENT:**
```json
{
  "action": "UPLOAD_DOCUMENT",
  "entityType": "Document",
  "entityId": "doc-uuid",
  "details": { "fileName": "contract.pdf", "fileSize": 524288 }
}
```

**DELETE_DOCUMENT:**
```json
{
  "action": "DELETE_DOCUMENT",
  "entityType": "Document",
  "entityId": "doc-uuid",
  "details": { "hadSignatures": true, "forced": true }
}
```

---

## Related Documentation

- [Signatures API](./signatures.md) - Signing documents
- [Storage & S3](../architecture/overview.md#storage) - File storage details
- [Database Schema](../architecture/database-schema.md) - Document model

---

**Last Updated:** 2025-02-06
