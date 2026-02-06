import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const preferencesSchema = z.object({
  language: z.enum(['ja', 'en']).optional(),
  timezone: z.string().max(50).optional(),
  dateFormat: z.string().max(20).optional(),
  emailNotifications: z.boolean().optional(),
  approvalNotifications: z.boolean().optional(),
  signatureNotifications: z.boolean().optional(),
  reminderNotifications: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = preferencesSchema.parse(body);

    // Preferences are stored client-side (localStorage) for now
    // since there's no preferences column in the User model.
    // This endpoint validates and acknowledges the save.
    return NextResponse.json({
      message: 'Preferences saved successfully',
      preferences: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Preferences update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
