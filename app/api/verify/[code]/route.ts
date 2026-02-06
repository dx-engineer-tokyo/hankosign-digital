import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: {
        verificationCode: code,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
            companyName: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                position: true,
              },
            },
            hanko: {
              select: {
                name: true,
                type: true,
              },
            },
          },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Remove sensitive data
    const safeDocument = {
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      status: document.status,
      verificationCode: document.verificationCode,
      createdAt: document.createdAt,
      completedAt: document.completedAt,
      createdBy: document.createdBy,
      signatures: document.signatures.map((sig: {
        id: string;
        timestamp: Date;
        isValid: boolean;
        user: {
          name: string;
          email: string;
          position: string | null;
        };
        hanko: {
          name: string;
          type: string;
        };
      }) => ({
        id: sig.id,
        timestamp: sig.timestamp,
        user: sig.user,
        hanko: sig.hanko,
        isValid: sig.isValid,
      })),
    };

    return NextResponse.json({ document: safeDocument });
  } catch (error) {
    console.error('Verify document error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
