# AWS S3 Integration

## What It Is

**AWS S3** (Simple Storage Service) is used for storing documents and hanko images. The project uses the **AWS SDK v3** (3.984.0) with the S3 client and request presigner modules. For local development, **MinIO** provides an S3-compatible API.

## Why We Use It

- **Scalable**: Handles any volume of documents without database bloat
- **Durable**: 99.999999999% (11 nines) durability
- **Presigned URLs**: Time-limited access without exposing credentials
- **S3 compatibility**: MinIO provides identical API for local development

## How It Works Here

### S3 Client Setup

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
const REGION = process.env.AWS_REGION || 'ap-northeast-1';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // MinIO requires endpoint and path-style access
  ...(S3_ENDPOINT ? {
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
  } : {}),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'hankosign-documents';
```

### File Upload

```typescript
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  // Return URL based on environment
  if (S3_ENDPOINT) {
    // MinIO (development): http://localhost:9000/bucket/key
    const base = S3_ENDPOINT.replace(/\/+$/, '');
    return `${base}/${BUCKET_NAME}/${key}`;
  }

  // AWS S3 (production): https://bucket.s3.region.amazonaws.com/key
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}
```

### Presigned URLs (Time-Limited Access)

```typescript
export async function getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }), { expiresIn });  // default: 1 hour
}
```

### File Deletion

```typescript
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }));
}
```

### Key Generation

Files are organized by type and user:

```typescript
// Documents: documents/{userId}/{timestamp}-{filename}
export function generateFileKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `documents/${userId}/${timestamp}-${cleanFileName}`;
}

// Hankos: hankos/{userId}/{hankoId}.png
export function generateHankoKey(userId: string, hankoId: string): string {
  return `hankos/${userId}/${hankoId}.png`;
}
```

**S3 key structure:**
```
hankosign-documents/
├── documents/
│   ├── user-uuid-1/
│   │   ├── 1707235200000-contract.pdf
│   │   └── 1707235300000-invoice.pdf
│   └── user-uuid-2/
│       └── 1707235400000-report.pdf
└── hankos/
    ├── user-uuid-1/
    │   ├── hanko_1707235200000.png
    │   └── hanko_1707235300000.png
    └── user-uuid-2/
        └── hanko_1707235400000.png
```

### Usage in API Routes

**Document upload (app/api/documents/route.ts):**
```typescript
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const s3Key = generateFileKey(session.user.id, file.name);
const fileUrl = await uploadFile(s3Key, buffer, file.type);

const document = await prisma.document.create({
  data: { fileUrl, fileName: file.name, ... },
});
```

**Hanko creation (app/api/hankos/route.ts):**
```typescript
const base64Data = validatedData.imageData.replace(/^data:image\/\w+;base64,/, '');
const buffer = Buffer.from(base64Data, 'base64');
const hankoId = `hanko_${Date.now()}`;
const s3Key = generateHankoKey(session.user.id, hankoId);
const imageUrl = await uploadFile(s3Key, buffer, 'image/png');
```

## MinIO (Local Development)

### Docker Compose Setup

```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio:latest
    container_name: hankosign-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    ports:
      - '9000:9000'     # S3 API
      - '9001:9001'     # Web console
    volumes:
      - hankosign_minio:/data

  minio-init:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin minioadmin &&
      mc mb -p local/hankosign-dev || true
      "
```

The `minio-init` service automatically creates the `hankosign-dev` bucket on first run.

### Development Environment Variables

```env
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET_NAME=hankosign-dev
```

### Production Environment Variables

```env
# No S3_ENDPOINT (uses real AWS)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET_NAME=hankosign-documents
```

## Key Files

- `lib/s3.ts` - S3 client, upload/download/delete functions, key generators
- `docker-compose.yml` - MinIO service definition
- `app/api/hankos/route.ts` - Uses S3 for hanko image storage
- `app/api/documents/route.ts` - Uses S3 for document file storage

## Best Practices

1. **Presigned URLs**: Never expose S3 credentials to the client. Use time-limited presigned URLs.
2. **Sanitize filenames**: `generateFileKey` strips special characters to prevent path traversal
3. **Timestamps in keys**: Prevents filename collisions and provides natural ordering
4. **User-scoped paths**: Files are organized by userId for access control and cleanup

## Common Pitfalls

1. **Missing `forcePathStyle`**: MinIO requires path-style access (`localhost:9000/bucket/key`), not virtual-hosted style
2. **CORS on MinIO/S3**: If serving files directly to the browser, configure CORS on the bucket
3. **Large file timeouts**: Default Next.js body parser limits may reject large uploads. FormData handling avoids this.
4. **Orphaned files**: Deleting a database record doesn't automatically delete the S3 file. The project notes this as a background cleanup task.

## Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK v3 for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO Docker Hub](https://hub.docker.com/r/minio/minio)
