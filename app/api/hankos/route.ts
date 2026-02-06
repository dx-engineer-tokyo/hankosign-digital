import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { uploadFile, generateHankoKey } from '@/lib/s3';

const MAX_IMAGE_DATA_LENGTH = 500_000; // ~375KB decoded, generous for a hanko PNG

const hankoSchema = z.object({
  name: z.string().min(1, 'Please enter a hanko name').max(50),
  type: z.enum(['MITOMEIN', 'GINKOIN', 'JITSUIN']),
  imageData: z.string().max(MAX_IMAGE_DATA_LENGTH, 'Image data is too large'),
  font: z.string().max(100).optional(),
  size: z.number().int().min(20).max(500).default(60),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const hankos = await prisma.hanko.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ hankos });
  } catch (error) {
    console.error('Get hankos error:', error);
    return NextResponse.json({ error: 'Failed to retrieve hankos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = hankoSchema.parse(body);

    // Convert base64 to buffer
    const base64Data = validatedData.imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique hanko ID
    const hankoId = `hanko_${Date.now()}`;
    const s3Key = generateHankoKey(session.user.id, hankoId);

    // Upload to S3
    const imageUrl = await uploadFile(s3Key, buffer, 'image/png');

    // Create hanko in database
    const hanko = await prisma.hanko.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        type: validatedData.type,
        imageUrl,
        imageData: validatedData.imageData, // Store base64 for quick access
        font: validatedData.font,
        size: validatedData.size,
      },
    });

    return NextResponse.json({ hanko }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create hanko error:', error);
    return NextResponse.json({ error: 'Failed to create hanko' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hankoId = searchParams.get('id');

    if (!hankoId) {
      return NextResponse.json({ error: 'Hanko ID is required' }, { status: 400 });
    }

    // Verify ownership
    const hanko = await prisma.hanko.findFirst({
      where: {
        id: hankoId,
        userId: session.user.id,
      },
    });

    if (!hanko) {
      return NextResponse.json({ error: 'Hanko not found' }, { status: 404 });
    }

    // Delete from database
    await prisma.hanko.delete({
      where: { id: hankoId },
    });

    return NextResponse.json({ message: 'Hanko deleted successfully' });
  } catch (error) {
    console.error('Delete hanko error:', error);
    return NextResponse.json({ error: 'Failed to delete hanko' }, { status: 500 });
  }
}
