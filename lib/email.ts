import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'HankoSign Digital <noreply@hankosign.jp>',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export function getApprovalRequestEmail(
  userName: string,
  documentTitle: string,
  documentUrl: string
): string {
  return `
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
          <h1>📋 承認依頼</h1>
        </div>
        <div class="content">
          <p>${escapeHtml(userName)}様</p>
          <p>以下の文書の承認をお願いいたします。</p>
          <p><strong>文書名:</strong> ${escapeHtml(documentTitle)}</p>
          <a href="${encodeURI(documentUrl)}" class="button">文書を確認する</a>
          <p>期限内に承認または却下をお願いします。</p>
        </div>
        <div class="footer">
          <p>HankoSign Digital - デジタル判子システム</p>
          <p>このメールは自動送信されています</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getDocumentCompletedEmail(
  userName: string,
  documentTitle: string,
  verificationUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Noto Sans JP', sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background: #f5f5f5; padding: 30px; }
        .button { 
          display: inline-block;
          background: #4CAF50;
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
          <h1>✅ 文書承認完了</h1>
        </div>
        <div class="content">
          <p>${escapeHtml(userName)}様</p>
          <p>以下の文書の承認が完了しました。</p>
          <p><strong>文書名:</strong> ${escapeHtml(documentTitle)}</p>
          <a href="${encodeURI(verificationUrl)}" class="button">検証ページを確認</a>
          <p>法的に有効な電子署名が適用されています。</p>
        </div>
        <div class="footer">
          <p>HankoSign Digital - デジタル判子システム</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
