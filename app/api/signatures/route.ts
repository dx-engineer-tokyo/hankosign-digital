import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const signatureSchema = z.object({
  documentId: z.string().uuid(),
  hankoId: z.string().uuid(),
  positionX: z.number().min(0),
  positionY: z.number().min(0),
  page: z.number().int().min(1).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = signatureSchema.parse(body);

    // Verify document exists
    const document = await prisma.document.findUnique({
      where: { id: validatedData.documentId },
      include: { signatures: true },
    });

    if (!document) {
      return NextResponse.json({ error: '文書が見つかりません' }, { status: 404 });
    }

    // Prevent signing documents that are already completed, rejected, or archived
    const NON_SIGNABLE_STATUSES = ['COMPLETED', 'REJECTED', 'ARCHIVED'];
    if (NON_SIGNABLE_STATUSES.includes(document.status)) {
      return NextResponse.json({ error: 'この文書には署名できません' }, { status: 400 });
    }

    // Verify hanko belongs to user
    const hanko = await prisma.hanko.findFirst({
      where: {
        id: validatedData.hankoId,
        userId: session.user.id,
      },
    });

    if (!hanko) {
      return NextResponse.json({ error: '判子が見つかりません' }, { status: 404 });
    }

    // Create signature
    const signature = await prisma.signature.create({
      data: {
        documentId: validatedData.documentId,
        hankoId: validatedData.hankoId,
        userId: session.user.id,
        positionX: validatedData.positionX,
        positionY: validatedData.positionY,
        page: validatedData.page,
        ipAddress: (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim(),
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
      include: {
        hanko: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Update document status if needed
    await prisma.document.update({
      where: { id: validatedData.documentId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    return NextResponse.json({ signature }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create signature error:', error);
    return NextResponse.json({ error: '署名の作成に失敗しました' }, { status: 500 });
  }
}
