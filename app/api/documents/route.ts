import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFile, generateFileKey } from '@/lib/s3';
import { generateVerificationCode } from '@/lib/utils';
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().min(1, 'Please enter a title'),
  description: z.string().optional(),
  templateType: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        createdById: session.user.id,
      },
      include: {
        signatures: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            hanko: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'Failed to retrieve documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const templateType = formData.get('templateType') as string;

    if (!file) {
      return NextResponse.json({ error: 'Please select a file' }, { status: 400 });
    }

    if (!title || title.length > 200) {
      return NextResponse.json({ error: 'Please enter a title (200 characters or less)' }, { status: 400 });
    }

    if (description && description.length > 2000) {
      return NextResponse.json({ error: 'Description must be 2000 characters or less' }, { status: 400 });
    }

    // Validate file size (max 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be 20MB or less' }, { status: 400 });
    }

    // Validate MIME type
    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File format not permitted' }, { status: 400 });
    }

    // Read file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate S3 key and upload
    const s3Key = generateFileKey(session.user.id, file.name);
    const fileUrl = await uploadFile(s3Key, buffer, file.type);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create document in database
    const document = await prisma.document.create({
      data: {
        title,
        description: description || undefined,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        createdById: session.user.id,
        verificationCode,
        templateType: templateType || undefined,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json({ error: 'Document upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        createdById: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from database (S3 cleanup can be done in background)
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
