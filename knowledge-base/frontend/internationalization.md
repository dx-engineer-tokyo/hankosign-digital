# Internationalization (i18n)

## What It Is

Internationalization (i18n) enables the application to support multiple languages. HankoSign Digital uses **next-intl** (4.8.2) to provide full Japanese and English language support with URL-based locale routing.

## Why We Use It

- **Japanese-first application**: Primary users are Japanese businesses, but English support enables international use
- **URL-based routing**: Clean URLs like `/ja/dashboard` and `/en/dashboard` for SEO and shareability
- **next-intl**: First-class support for Next.js App Router with Server Components

## How It Works Here

### Locale Configuration

```typescript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',     // Japanese is the default
});
```

### Message Loading (Server-Side)

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;    // fallback to 'ja'
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Locale-Aware Navigation

```typescript
// i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

Usage in components:
```typescript
import { Link } from '@/i18n/navigation';

// Automatically adds current locale prefix
<Link href="/dashboard">Dashboard</Link>
// In Japanese context: renders as /ja/dashboard
// In English context: renders as /en/dashboard
```

### Translation Files

```json
// messages/ja.json (excerpt)
{
  "home": {
    "heroTitle": "判子文化を、デジタルへ。",
    "login": "ログイン",
    "register": "無料で始める"
  },
  "hankoDesigner": {
    "preview": "プレビュー",
    "textLabel": "判子テキスト",
    "textPlaceholder": "名前を入力",
    "maxChars": "最大4文字まで入力できます",
    "fontLabel": "フォント",
    "rotation": "回転角度",
    "save": "この判子を保存"
  },
  "dashboardOverview": {
    "title": "ダッシュボード",
    "welcome": "ようこそ、"
  }
}
```

```json
// messages/en.json (excerpt)
{
  "home": {
    "heroTitle": "Hanko Culture, Digitized.",
    "login": "Log In",
    "register": "Get Started Free"
  },
  "hankoDesigner": {
    "preview": "Preview",
    "textLabel": "Hanko Text",
    "textPlaceholder": "Enter name",
    "maxChars": "Maximum 4 characters",
    "fontLabel": "Font",
    "rotation": "Rotation",
    "save": "Save This Hanko"
  },
  "dashboardOverview": {
    "title": "Dashboard",
    "welcome": "Welcome, "
  }
}
```

### Using Translations in Components

```typescript
// Client components use the useTranslations hook
'use client';
import { useTranslations } from 'next-intl';

export default function HankoDesigner({ ... }) {
  const t = useTranslations('hankoDesigner');

  return (
    <label>{t('textLabel')}</label>
    // Japanese: "判子テキスト"
    // English: "Hanko Text"
  );
}
```

### Provider Setup

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>{children}</AuthProvider>
    </NextIntlClientProvider>
  );
}
```

### Middleware Integration

The middleware in `proxy.ts` delegates to next-intl's middleware for locale detection and routing:

```typescript
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req) {
  // ... auth checks ...
  return intlMiddleware(req);  // handles locale routing
}
```

## i18n Architecture

```
Browser request: /dashboard
    ↓
Middleware: detect locale → redirect to /ja/dashboard
    ↓
Layout: load messages/ja.json
    ↓
NextIntlClientProvider: provide messages to component tree
    ↓
Component: useTranslations('namespace') → get translated string
```

## Key Files

- `i18n/routing.ts` - Locale configuration (ja, en)
- `i18n/request.ts` - Server-side message loading
- `i18n/navigation.ts` - Locale-aware Link, redirect, usePathname, useRouter
- `messages/ja.json` - Japanese translations
- `messages/en.json` - English translations
- `proxy.ts` - Middleware integration with i18n
- `app/[locale]/layout.tsx` - Provider setup
- `next.config.js` - next-intl plugin configuration

## Best Practices

1. **Namespace translations**: Group by page/component (`home`, `dashboard`, `hankoDesigner`)
2. **Use locale-aware `Link`**: Always import from `@/i18n/navigation`, not from `next/link`
3. **Keep message keys consistent**: Same key structure in both `ja.json` and `en.json`
4. **Default locale is Japanese**: The primary audience is Japanese businesses

## Common Pitfalls

1. **Using Next.js `Link` instead of next-intl `Link`**: Will produce URLs without the locale prefix
2. **Missing translation keys**: If a key exists in `ja.json` but not `en.json`, the English page will show the key name
3. **Hardcoded strings**: Any user-visible text should go through the translation system

## Resources

- [next-intl Documentation](https://next-intl.dev/)
- [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl Navigation API](https://next-intl.dev/docs/routing/navigation)
