# Email Service

## What It Is

The email service uses **Nodemailer** (7.0.7) to send transactional emails via SMTP. It handles approval request notifications and document completion confirmations.

## Why We Use It

- **Nodemailer**: Industry-standard Node.js email library, reliable and well-maintained
- **SMTP**: Works with any email provider (Gmail, SendGrid, AWS SES, etc.)
- **HTML templates**: Rich formatted emails with Japanese text and branding

## How It Works Here

### SMTP Configuration

```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           // smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,                          // TLS (not SSL)
  auth: {
    user: process.env.SMTP_USER,          // Gmail address
    pass: process.env.SMTP_PASSWORD,      // App-specific password
  },
});
```

### Sending Emails

```typescript
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
```

The function returns a result object instead of throwing, allowing callers to handle email failures gracefully without breaking the main operation.

### Email Templates

**Approval Request Email** (`getApprovalRequestEmail`):
- Red header with "承認依頼" (Approval Request) title
- Recipient's name
- Document title
- CTA button linking to the document
- Styled with inline CSS for email client compatibility

```typescript
export function getApprovalRequestEmail(userName, documentTitle, documentUrl) {
  return `
    <div class="header" style="background: #D32F2F; color: white;">
      <h1>承認依頼</h1>
    </div>
    <div class="content">
      <p>${escapeHtml(userName)}様</p>
      <p>以下の文書の承認をお願いいたします。</p>
      <p><strong>文書名:</strong> ${escapeHtml(documentTitle)}</p>
      <a href="${encodeURI(documentUrl)}" class="button">文書を確認する</a>
    </div>
  `;
}
```

**Document Completed Email** (`getDocumentCompletedEmail`):
- Green header with "文書承認完了" (Document Approval Complete) title
- Verification page link
- Legal compliance notice

### Security

The email templates include security measures:

```typescript
// XSS prevention - HTML entity escaping
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// URL encoding for links
<a href="${encodeURI(documentUrl)}">
```

## Environment Variables

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password     # Gmail: generate an App Password
SMTP_FROM=HankoSign Digital <noreply@hankosign.jp>
```

## Key Files

- `lib/email.ts` - Email service: transporter, sendEmail, templates

## Best Practices

1. **Don't fail the main operation on email failure**: Email sending returns `{ success, error }` instead of throwing
2. **Escape user content**: Always escape dynamic content in HTML templates to prevent injection
3. **Use inline CSS**: Many email clients strip `<style>` tags. Inline styles are more reliable.
4. **App Passwords for Gmail**: Regular passwords won't work with Gmail SMTP. Generate an App Password.

## Common Pitfalls

1. **Gmail rate limits**: Gmail allows ~500 emails/day for regular accounts. Use a transactional email service for production.
2. **Missing App Password**: Gmail blocks SMTP login without an App Password when 2FA is enabled
3. **HTML rendering**: Email HTML support varies wildly. Test in multiple clients.

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
