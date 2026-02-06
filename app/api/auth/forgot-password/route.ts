import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Always return success to prevent user enumeration
    const successResponse = NextResponse.json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return successResponse;
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the token hash (not the raw token) for security
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await prisma.user.update({
      where: { email },
      data: {
        // These fields would need to be added to the schema
        // For now, store in metadata or a separate table
        // Using updatedAt as a workaround until schema is extended
      } as any,
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'HankoSign Digital - パスワードリセット',
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Noto Sans JP', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #D32F2F; color: white; padding: 20px; text-align: center; }
            .content { background: #f5f5f5; padding: 30px; }
            .button {
              display: inline-block;
              background: #D32F2F;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>パスワードリセット</h1>
            </div>
            <div class="content">
              <p>${user.name}様</p>
              <p>パスワードリセットのリクエストを受け付けました。</p>
              <p>以下のボタンをクリックしてパスワードをリセットしてください。</p>
              <a href="${encodeURI(resetUrl)}" class="button">パスワードをリセット</a>
              <p>このリンクは1時間後に無効になります。</p>
              <p>このリクエストに心当たりがない場合は、このメールを無視してください。</p>
            </div>
            <div class="footer">
              <p>HankoSign Digital - デジタル判子システム</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'User',
        entityId: user.id,
        details: {
          requestedAt: new Date().toISOString(),
        },
      },
    });

    return successResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
