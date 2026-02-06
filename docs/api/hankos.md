# Hankos API

## Overview

The Hankos API manages digital seals (判子) for users. Users can create, retrieve, and delete their personal digital hankos in three types: Mitomein (認印), Ginkoin (銀行印), and Jitsuin (実印).

## Base URL

```
/api/hankos
```

## Authentication

All endpoints require authentication via NextAuth session.

## Endpoints

### List User's Hankos

Retrieve all hankos owned by the authenticated user.

**Endpoint:** `GET /api/hankos`

**Authentication:** Required

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "hankos": [
    {
      "id": "uuid-string",
      "userId": "user-uuid",
      "name": "営業部用認印",
      "type": "MITOMEIN",
      "imageUrl": "https://s3.amazonaws.com/bucket/hanko-image.png",
      "imageData": "data:image/png;base64,iVBORw0KGgo...",
      "font": "篆書体",
      "size": 60,
      "isRegistered": false,
      "registrationNumber": null,
      "createdAt": "2025-02-06T10:00:00.000Z",
      "updatedAt": "2025-02-06T10:00:00.000Z"
    },
    {
      "id": "uuid-string-2",
      "userId": "user-uuid",
      "name": "実印",
      "type": "JITSUIN",
      "imageUrl": "https://s3.amazonaws.com/bucket/hanko-image-2.png",
      "imageData": "data:image/png;base64,abc123...",
      "font": "古印体",
      "size": 80,
      "isRegistered": true,
      "registrationNumber": "12345-67890",
      "createdAt": "2025-02-01T10:00:00.000Z",
      "updatedAt": "2025-02-01T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

`401 Unauthorized`
```json
{
  "error": "Unauthorized"
}
```

---

### Create New Hanko

Create a new digital hanko for the authenticated user.

**Endpoint:** `POST /api/hankos`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "営業部用認印",
  "type": "MITOMEIN",
  "imageData": "data:image/png;base64,iVBORw0KGgo...",
  "font": "篆書体",
  "size": 60,
  "isRegistered": false,
  "registrationNumber": null
}
```

**Required Fields:**
- `name` (string) - Hanko label/name
- `type` (enum) - HankoType: `MITOMEIN`, `GINKOIN`, or `JITSUIN`
- `imageData` (string) - Base64 encoded image data (PNG recommended)

**Optional Fields:**
- `font` (string) - Font type (篆書体, 古印体, 隷書体, etc.)
- `size` (number) - Size in pixels (default: 60, range: 40-200)
- `isRegistered` (boolean) - Jitsuin registration status (default: false)
- `registrationNumber` (string) - Municipal registration number (for Jitsuin)

**Response (201 Created):**
```json
{
  "hanko": {
    "id": "uuid-string",
    "userId": "user-uuid",
    "name": "営業部用認印",
    "type": "MITOMEIN",
    "imageUrl": "https://s3.amazonaws.com/bucket/hanko-uuid.png",
    "imageData": "data:image/png;base64,iVBORw0KGgo...",
    "font": "篆書体",
    "size": 60,
    "isRegistered": false,
    "registrationNumber": null,
    "createdAt": "2025-02-06T10:00:00.000Z",
    "updatedAt": "2025-02-06T10:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "error": "Invalid hanko type"
}
```

`401 Unauthorized`
```json
{
  "error": "Unauthorized"
}
```

`500 Internal Server Error`
```json
{
  "error": "Failed to create hanko"
}
```

---

### Get Single Hanko

Retrieve details of a specific hanko.

**Endpoint:** `GET /api/hankos/[id]`

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Hanko UUID

**Response (200 OK):**
```json
{
  "hanko": {
    "id": "uuid-string",
    "userId": "user-uuid",
    "name": "営業部用認印",
    "type": "MITOMEIN",
    "imageUrl": "https://s3.amazonaws.com/bucket/hanko-image.png",
    "imageData": "data:image/png;base64,iVBORw0KGgo...",
    "font": "篆書体",
    "size": 60,
    "isRegistered": false,
    "registrationNumber": null,
    "createdAt": "2025-02-06T10:00:00.000Z",
    "updatedAt": "2025-02-06T10:00:00.000Z"
  }
}
```

**Error Responses:**

`403 Forbidden` - User doesn't own this hanko
```json
{
  "error": "Forbidden: You can only access your own hankos"
}
```

`404 Not Found`
```json
{
  "error": "Hanko not found"
}
```

---

### Delete Hanko

Delete a user's hanko. Cannot delete if hanko has been used in signatures.

**Endpoint:** `DELETE /api/hankos/[id]`

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Hanko UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hanko deleted successfully"
}
```

**Error Responses:**

`400 Bad Request` - Hanko is in use
```json
{
  "error": "Cannot delete hanko that has been used in signatures"
}
```

`403 Forbidden` - User doesn't own this hanko
```json
{
  "error": "Forbidden: You can only delete your own hankos"
}
```

`404 Not Found`
```json
{
  "error": "Hanko not found"
}
```

---

## Hanko Types

### MITOMEIN (認印)
- **Name:** Acknowledgment seal
- **Use:** Everyday documents, memos, receipts
- **Registration:** Not required
- **Legal weight:** Low

### GINKOIN (銀行印)
- **Name:** Bank seal
- **Use:** Banking transactions, financial documents
- **Registration:** Registered with bank
- **Legal weight:** Medium

### JITSUIN (実印)
- **Name:** Registered seal
- **Use:** Legal contracts, property transactions
- **Registration:** Registered with municipality
- **Legal weight:** High (legally binding)

---

## Image Requirements

### Format
- PNG (recommended)
- JPEG (acceptable)
- WebP (acceptable)
- Base64 encoded

### Dimensions
- Minimum: 40x40 pixels
- Maximum: 200x200 pixels
- Recommended: 60x60 or 80x80 pixels
- Aspect ratio: 1:1 (square)

### File Size
- Maximum: 500KB
- Recommended: < 100KB

### Design Guidelines
- Red color (#D32F2F recommended)
- White/transparent background
- Traditional seal fonts (篆書体、古印体、隷書体)
- 1-4 characters optimal
- Circular or square shape

---

## Client Usage Examples

### React Component (List Hankos)

```typescript
const [hankos, setHankos] = useState([])

useEffect(() => {
  const fetchHankos = async () => {
    const response = await fetch('/api/hankos')
    const data = await response.json()
    setHankos(data.hankos)
  }
  fetchHankos()
}, [])
```

### React Component (Create Hanko)

```typescript
const createHanko = async (imageData: string, name: string, type: HankoType) => {
  const response = await fetch('/api/hankos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      type,
      imageData,
      font: '篆書体',
      size: 60
    })
  })

  if (response.ok) {
    const { hanko } = await response.json()
    console.log('Hanko created:', hanko.id)
  }
}
```

### React Component (Delete Hanko)

```typescript
const deleteHanko = async (hankoId: string) => {
  const confirmed = confirm('この判子を削除してもよろしいですか？')
  if (!confirmed) return

  const response = await fetch(`/api/hankos/${hankoId}`, {
    method: 'DELETE'
  })

  if (response.ok) {
    // Refresh hanko list
    fetchHankos()
  } else {
    const error = await response.json()
    alert(error.error)
  }
}
```

---

## Storage

### Database Storage
- Metadata stored in PostgreSQL `Hanko` table
- Base64 image data stored in `imageData` field (Text type)

### S3 Storage
- Original image file uploaded to AWS S3
- URL stored in `imageUrl` field
- Bucket: Configured via `AWS_S3_BUCKET_NAME` env variable
- Naming: `hankos/{userId}/{hankoId}.png`

### Dual Storage Rationale
- **S3:** Primary source, CDN delivery, backup
- **Database:** Quick preview, offline access, redundancy

---

## Permissions

### Ownership Rules
- Users can only create hankos for themselves
- Users can only view their own hankos
- Users can only delete their own hankos
- Admins cannot access other users' hankos

### Deletion Rules
- Cannot delete hanko if used in any signature (data integrity)
- Soft delete option available in future (mark as inactive)

---

## Audit Logging

All hanko operations are logged in the `AuditLog` table:

**CREATE_HANKO:**
```json
{
  "action": "CREATE_HANKO",
  "entityType": "Hanko",
  "entityId": "hanko-uuid",
  "details": { "type": "MITOMEIN", "name": "営業部用認印" }
}
```

**DELETE_HANKO:**
```json
{
  "action": "DELETE_HANKO",
  "entityType": "Hanko",
  "entityId": "hanko-uuid",
  "details": { "hadSignatures": false }
}
```

---

## Related Documentation

- [Signatures API](./signatures.md) - Using hankos to sign documents
- [Database Schema](../architecture/database-schema.md) - Hanko model details
- [Glossary](../reference/glossary.md) - Japanese business terms

---

**Last Updated:** 2025-02-06
