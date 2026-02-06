import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  company: z.string().max(100).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // Send notification to support
    await sendEmail({
      to: process.env.SUPPORT_EMAIL || 'support@hankosign.jp',
      subject: `[お問い合わせ] ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: 'Noto Sans JP', sans-serif;">
          <h2>新しいお問い合わせ</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; font-weight: bold;">お名前:</td><td style="padding: 8px;">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">メール:</td><td style="padding: 8px;">${escapeHtml(data.email)}</td></tr>
            ${data.company ? `<tr><td style="padding: 8px; font-weight: bold;">会社名:</td><td style="padding: 8px;">${escapeHtml(data.company)}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold;">件名:</td><td style="padding: 8px;">${escapeHtml(data.subject)}</td></tr>
          </table>
          <h3>お問い合わせ内容:</h3>
          <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </body>
        </html>
      `,
    });

    // Send confirmation to the user
    await sendEmail({
      to: data.email,
      subject: 'HankoSign Digital - お問い合わせを受け付けました',
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
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>お問い合わせ受付完了</h1>
            </div>
            <div class="content">
              <p>${escapeHtml(data.name)}様</p>
              <p>お問い合わせいただきありがとうございます。</p>
              <p>担当者より2営業日以内にご連絡させていただきます。</p>
              <p><strong>件名:</strong> ${escapeHtml(data.subject)}</p>
            </div>
            <div class="footer">
              <p>HankoSign Digital - デジタル判子システム</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
