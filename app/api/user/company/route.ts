import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const companySchema = z.object({
  companyName: z.string().max(200).optional(),
  corporateNumber: z.string().max(13).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = companySchema.parse(body);

    // Update company info
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        companyName: validatedData.companyName,
        corporateNumber: validatedData.corporateNumber,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: 'COMPANY_INFO_UPDATED',
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
    console.error('Error updating company info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
