import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  nameKana: z.string().max(100).optional(),
  email: z.string().email(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    // Check if email is being changed and if it's already taken
    if (validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        name: validatedData.name,
        nameKana: validatedData.nameKana,
        email: validatedData.email,
        department: validatedData.department,
        position: validatedData.position,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: 'PROFILE_UPDATED',
        entityType: 'User',
        entityId: updatedUser.id,
        details: {
          updatedFields: Object.keys(validatedData),
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
