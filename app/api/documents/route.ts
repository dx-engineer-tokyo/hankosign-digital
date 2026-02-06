import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFile, generateFileKey } from '@/lib/s3';
import { generateVerificationCode } from '@/lib/utils';
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
  templateType: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
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
    return NextResponse.json({ error: '文書の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const templateType = formData.get('templateType') as string;

    if (!file) {
      return NextResponse.json({ error: 'ファイルを選択してください' }, { status: 400 });
    }

    if (!title || title.length > 200) {
      return NextResponse.json({ error: 'タイトルを入力してください（200文字以内）' }, { status: 400 });
    }

    if (description && description.length > 2000) {
      return NextResponse.json({ error: '説明は2000文字以内にしてください' }, { status: 400 });
    }

    // Validate file size (max 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'ファイルサイズは20MB以下にしてください' }, { status: 400 });
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
      return NextResponse.json({ error: '許可されていないファイル形式です' }, { status: 400 });
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
    return NextResponse.json({ error: '文書のアップロードに失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: '文書IDが必要です' }, { status: 400 });
    }

    // Verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        createdById: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: '文書が見つかりません' }, { status: 404 });
    }

    // Delete from database (S3 cleanup can be done in background)
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: '文書を削除しました' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: '文書の削除に失敗しました' }, { status: 500 });
  }
}
