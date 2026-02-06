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
  ...(S3_ENDPOINT ? {
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
  } : {}),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'hankosign-documents';

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

  if (S3_ENDPOINT) {
    const base = S3_ENDPOINT.replace(/\/+$/, '');
    return `${base}/${BUCKET_NAME}/${key}`;
  }

  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

export async function getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }), { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }));
}

export function generateFileKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `documents/${userId}/${timestamp}-${cleanFileName}`;
}

export function generateHankoKey(userId: string, hankoId: string): string {
  return `hankos/${userId}/${hankoId}.png`;
}
