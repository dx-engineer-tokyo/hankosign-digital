import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import crypto from 'crypto';

export function formatJapaneseDate(date: Date): string {
  return format(date, 'yyyy年MM月dd日', { locale: ja });
}

export function formatJapaneseDateTime(date: Date): string {
  return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ja });
}

export function getJapaneseEra(date: Date): string {
  const year = date.getFullYear();
  
  if (year >= 2019) {
    const reiwaYear = year - 2019 + 1;
    return `令和${reiwaYear === 1 ? '元' : reiwaYear}年`;
  } else if (year >= 1989) {
    const heiseiYear = year - 1989 + 1;
    return `平成${heiseiYear === 1 ? '元' : heiseiYear}年`;
  }
  
  return `${year}年`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(12);
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(randomBytes[i] % chars.length);
  }
  return code.match(/.{1,4}/g)?.join('-') || code;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'badge-ghost',
    PENDING: 'badge-warning',
    IN_PROGRESS: 'badge-info',
    COMPLETED: 'badge-success',
    REJECTED: 'badge-error',
    ARCHIVED: 'badge-neutral',
  };
  
  return colors[status] || 'badge-ghost';
}

export function getHankoTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MITOMEIN: '認印',
    GINKOIN: '銀行印',
    JITSUIN: '実印',
  };
  
  return labels[type] || type;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
