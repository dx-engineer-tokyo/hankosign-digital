# Next.js App Router

## What It Is

Next.js is a React framework that provides server-side rendering, file-based routing, API routes, and build optimization. This project uses **Next.js 16.1.6** with the **App Router** (introduced in Next.js 13), which is the modern routing paradigm based on React Server Components.

## Why We Use It

- **Full-stack in one framework**: Frontend pages and backend API routes in a single codebase
- **File-based routing**: Directory structure defines URL paths automatically
- **Server Components by default**: Better performance, smaller client bundles
- **Built-in optimization**: Image optimization, font loading, code splitting
- **Middleware support**: Request interception for auth and i18n
- **TypeScript-first**: Full type safety out of the box

## How It Works Here

### File-Based Routing

Every directory under `app/` with a `page.tsx` becomes a route:

```
app/
├── [locale]/
│   ├── page.tsx              → /ja or /en (home)
│   ├── login/page.tsx        → /ja/login or /en/login
│   ├── register/page.tsx     → /ja/register or /en/register
│   ├── dashboard/
│   │   ├── page.tsx          → /ja/dashboard
│   │   ├── hankos/
│   │   │   ├── page.tsx      → /ja/dashboard/hankos
│   │   │   └── create/page.tsx → /ja/dashboard/hankos/create
│   │   ├── documents/page.tsx → /ja/dashboard/documents
│   │   ├── signatures/page.tsx → /ja/dashboard/signatures
│   │   ├── workflows/page.tsx → /ja/dashboard/workflows
│   │   ├── settings/page.tsx  → /ja/dashboard/settings
│   │   └── roles/page.tsx     → /ja/dashboard/roles (admin only)
│   ├── verify/page.tsx        → /ja/verify
│   └── help/page.tsx          → /ja/help
└── api/                       → API routes (no [locale])
    ├── hankos/route.ts        → /api/hankos
    ├── documents/route.ts     → /api/documents
    └── signatures/route.ts    → /api/signatures
```

### Dynamic Route Segments

The `[locale]` segment captures the locale from the URL:

```typescript
// app/[locale]/layout.tsx
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;  // Next.js 16: params is a Promise
}) {
  const { locale } = await params;      // 'ja' or 'en'
  // ...
}
```

### Static Params Generation

For static optimization, the layout declares which locale values exist:

```typescript
// app/[locale]/layout.tsx
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
  // Returns: [{ locale: 'ja' }, { locale: 'en' }]
}
```

### Layouts

Layouts wrap pages and persist across navigation. They can be nested.

```typescript
// app/[locale]/layout.tsx - Root layout for all locale pages
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <div className={notoSansJP.className}>
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
```

This layout:
1. Loads the Noto Sans JP font
2. Provides i18n messages via `NextIntlClientProvider`
3. Wraps everything in `AuthProvider` for NextAuth session access
4. Passes `children` (the page component) through

### Metadata

Page metadata is defined as an export:

```typescript
// app/[locale]/layout.tsx
export const metadata: Metadata = {
  title: 'HankoSign Digital - デジタル判子システム',
  description: '日本の伝統的な判子文化とデジタルワークフローを融合した電子署名システム',
  keywords: '判子, デジタル署名, 電子印鑑, 稟議, ワークフロー, DX',
};
```

## Server Components vs Client Components

### Server Components (Default)

By default, all components in the App Router are Server Components. They:
- Run only on the server
- Can directly access databases, file system, and environment variables
- Cannot use React hooks (`useState`, `useEffect`, etc.)
- Cannot use browser APIs
- Don't send component JavaScript to the client

```typescript
// app/[locale]/layout.tsx - Server Component (no 'use client')
// Can use: await, server-only imports, getMessages()
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;              // server-only async
  const messages = await getMessages();         // server function
  return <div>{children}</div>;
}
```

### Client Components

Marked with `'use client'` at the top of the file. They:
- Run on both server (for initial render) and client
- Can use React hooks and browser APIs
- Receive data from Server Components via props

```typescript
// components/HankoDesigner.tsx - Client Component
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function HankoDesigner({ onSave, initialText = '', size = 200 }) {
  const [text, setText] = useState(initialText);   // hooks require 'use client'
  const canvasRef = useRef(null);                   // refs require 'use client'
  // ...
}
```

### Client Components in This Project

| Component | Why Client | Key Hooks Used |
|-----------|-----------|----------------|
| `HankoDesigner.tsx` | Canvas manipulation, user input | `useState`, `useEffect`, `useRef` |
| `HomePage.tsx` | Interactive navigation, translations | `useTranslations` |
| `AuthProvider.tsx` | SessionProvider requires client context | `SessionProvider` |
| `dashboard/page.tsx` | Session access on client, translations | `useSession`, `useTranslations` |

## API Routes

API routes are defined in `app/api/` using `route.ts` files with named exports for HTTP methods:

```typescript
// app/api/hankos/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle GET /api/hankos
  return NextResponse.json({ hankos: [...] });
}

export async function POST(request: NextRequest) {
  // Handle POST /api/hankos
  const body = await request.json();
  return NextResponse.json({ hanko: {...} }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  // Handle DELETE /api/hankos?id=xxx
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  return NextResponse.json({ message: 'Deleted' });
}
```

### Request Handling Patterns

```typescript
// JSON body
const body = await request.json();

// FormData (file uploads)
const formData = await request.formData();
const file = formData.get('file') as File;

// Query parameters
const { searchParams } = new URL(request.url);
const id = searchParams.get('id');

// Headers
const ip = request.headers.get('x-forwarded-for');
const userAgent = request.headers.get('user-agent');
```

### Response Patterns

```typescript
// Success
return NextResponse.json({ data }, { status: 200 });
return NextResponse.json({ data }, { status: 201 });

// Errors
return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
return NextResponse.json({ error: 'Not found' }, { status: 404 });
return NextResponse.json({ error: 'Server error' }, { status: 500 });
```

## Middleware

The middleware (`proxy.ts` at the project root) intercepts every request:

```typescript
// proxy.ts
export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip API and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Auth check for dashboard
  if (pathname.includes('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl.origin));
    }

    // Admin-only route check
    if (pathname.includes('/dashboard/roles')) {
      if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.nextUrl.origin));
      }
    }
  }

  return intlMiddleware(req);  // handle i18n routing
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Next.js Configuration

```javascript
// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
  },
  webpack: (config) => {
    // Exclude 'canvas' from client bundle (Fabric.js peer dependency)
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

module.exports = withNextIntl(nextConfig);
```

## Font Loading

Next.js optimizes font loading with `next/font`:

```typescript
// app/[locale]/layout.tsx
import { Noto_Sans_JP } from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',    // show fallback font while loading
});

// Apply via className
<div className={notoSansJP.className}>
```

## Key Files

- `app/[locale]/layout.tsx` - Root layout, providers, font, metadata
- `app/[locale]/dashboard/page.tsx` - Client component page example
- `app/api/hankos/route.ts` - API route with GET/POST/DELETE
- `app/api/documents/route.ts` - File upload API route
- `proxy.ts` - Middleware (auth + i18n)
- `next.config.js` - Framework configuration

## Best Practices

1. **Default to Server Components**: Only add `'use client'` when you need hooks or browser APIs
2. **Keep API routes thin**: Validate input, call service functions, return response
3. **Use layouts for shared UI**: Navigation, providers, and persistent elements belong in layouts
4. **Leverage middleware for cross-cutting concerns**: Auth and i18n happen before the page renders

## Common Pitfalls

1. **Using hooks in Server Components**: Adding `useState` without `'use client'` causes a build error
2. **Forgetting to await params in Next.js 16**: Route params are now `Promise` objects
3. **Importing server-only code in client components**: Database clients and secrets must stay on the server
4. **Not handling the `[locale]` segment**: All internal links must include the locale prefix

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
