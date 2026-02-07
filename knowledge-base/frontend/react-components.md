# React Components

## What It Is

React is a JavaScript library for building user interfaces through composable components. This project uses **React 19.2.4** with both Server Components (RSC) and Client Components within the Next.js App Router.

## Why We Use It

- **Component-based architecture**: Each UI piece is a self-contained, reusable unit
- **React 19 features**: Latest React with improved performance and Server Components support
- **Ecosystem**: Rich library support (NextAuth, next-intl, react-hook-form, react-pdf, etc.)
- **Next.js integration**: Seamless server/client rendering with the App Router

## Component Patterns in This Project

### Function Components

All components in this project are function components (no class components):

```typescript
// Server Component (default in App Router)
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  return <div>{children}</div>;
}

// Client Component
'use client';
export default function HankoDesigner({ onSave, initialText = '', size = 200 }) {
  const [text, setText] = useState(initialText);
  return <div>...</div>;
}
```

### Props with TypeScript Interfaces

Every component defines its props with a TypeScript interface:

```typescript
// components/HankoDesigner.tsx
interface HankoDesignerProps {
  onSave: (imageData: string) => void;  // callback function
  initialText?: string;                  // optional with default
  size?: number;                         // optional with default
}

export default function HankoDesigner({
  onSave,
  initialText = '',
  size = 200
}: HankoDesignerProps) { ... }

// components/Alert.tsx
type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;          // any rendereable content
  className?: string;           // optional CSS class override
}

export default function Alert({ variant, children, className = '' }: AlertProps) { ... }
```

### Provider Pattern

Used to make context available to the component tree:

```typescript
// components/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// Used in app/[locale]/layout.tsx
<AuthProvider>
  {children}
</AuthProvider>
```

The layout wraps providers in a specific order:
```
NextIntlClientProvider (i18n messages)
  └── AuthProvider (NextAuth session)
        └── {children} (page content)
```

### Composition Pattern

Pages compose smaller components together:

```typescript
// components/HomePage.tsx - composes multiple sections
export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-white">
      <nav>...</nav>           {/* Navigation bar */}
      <section>...</section>   {/* Hero section */}
      <section>...</section>   {/* Features grid */}
      <section>...</section>   {/* Use cases */}
      <section>...</section>   {/* CTA */}
      <footer>...</footer>     {/* Footer */}
    </div>
  );
}
```

## React Hooks Used

### useState

Manages local component state:

```typescript
// components/HankoDesigner.tsx
const [text, setText] = useState(initialText);     // string state
const [font, setFont] = useState('serif');          // string state
const [rotation, setRotation] = useState(0);        // number state
const [canvas, setCanvas] = useState<any>(null);    // nullable state

// Usage: update state on user input
<input
  value={text}
  onChange={(e) => setText(e.target.value)}
  maxLength={4}
/>
```

### useEffect

Runs side effects after render:

```typescript
// components/HankoDesigner.tsx - initialize Fabric.js canvas
useEffect(() => {
  let isMounted = true;

  const initCanvas = async () => {
    if (!canvasRef.current) return;
    const mod = await import('fabric');          // dynamic import
    if (!isMounted) return;                      // guard against unmount

    const fabricCanvas = new mod.Canvas(canvasRef.current, {
      width: size,
      height: size,
      backgroundColor: 'transparent',
    });
    setCanvas(fabricCanvas);
  };

  initCanvas();

  return () => {                                 // cleanup function
    isMounted = false;
    if (canvasInstanceRef.current) {
      canvasInstanceRef.current.dispose();
    }
  };
}, [size]);                                      // dependency: re-run when size changes
```

```typescript
// Redraw canvas when state changes
useEffect(() => {
  if (!canvas || !fabric) return;
  canvas.clear();

  // Draw circle border
  const circle = new fabric.Circle({ ... });
  canvas.add(circle);

  // Add text
  if (text) {
    const hankoText = new fabric.Text(text, { ... });
    canvas.add(hankoText);
  }

  canvas.renderAll();
}, [canvas, text, font, rotation, size]);        // redraw on any change
```

### useRef

Holds a mutable reference that persists across renders without causing re-renders:

```typescript
// components/HankoDesigner.tsx
const canvasRef = useRef<HTMLCanvasElement>(null);    // DOM element reference
const fabricRef = useRef<any>(null);                   // library module reference
const canvasInstanceRef = useRef<any>(null);           // Fabric canvas instance

// canvasRef is attached to the DOM element
<canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />
```

### useSession (NextAuth)

Accesses the authentication session on the client:

```typescript
// app/[locale]/dashboard/page.tsx
'use client';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <p>Welcome, {session?.user?.name}</p>
  );
}
```

### useTranslations (next-intl)

Accesses translation strings:

```typescript
// components/HomePage.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return <h1>{t('heroTitle')}</h1>;
  // Reads from messages/ja.json or messages/en.json
  // under the "home" namespace
}
```

## Component Catalog

### Alert Component

**File:** `components/Alert.tsx`

Reusable notification component with four variants:

```typescript
// Usage
<Alert variant="error">An error occurred</Alert>
<Alert variant="success">Operation completed</Alert>
<Alert variant="warning">Please check the input</Alert>
<Alert variant="info">Additional information</Alert>

// With custom class
<Alert variant="error" className="mt-4">Error message</Alert>
```

Implementation uses a `Record` to map variants to styles and icons, keeping the render function clean.

### HankoDesigner Component

**File:** `components/HankoDesigner.tsx`

Interactive canvas-based hanko creation tool:

```typescript
// Usage
<HankoDesigner
  onSave={(imageData) => handleSaveHanko(imageData)}  // receives base64 PNG
  initialText="田中"
  size={200}
/>
```

Features:
- Text input (max 4 characters for seal text)
- Font selection (serif, sans-serif, cursive, monospace)
- Rotation control (-45 to +45 degrees)
- Live preview via Fabric.js canvas
- Export as PNG data URL at 2x resolution

### AuthProvider Component

**File:** `components/AuthProvider.tsx`

Thin wrapper around NextAuth's `SessionProvider`:

```typescript
// Must be a client component because SessionProvider uses React Context
'use client';
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### HomePage Component

**File:** `components/HomePage.tsx`

Marketing landing page with:
- Navigation bar with login/register links
- Hero section with statistics
- Feature grid (4 features)
- Use case cards (3 cases)
- CTA section
- Footer with legal links

All text is internationalized via `useTranslations('home')`.

### HankoIcon Component

**File:** `components/HankoIcon.tsx`

Custom SVG icon used for branding throughout the app.

## Locale-Aware Navigation

The project uses `next-intl`'s `Link` component instead of Next.js's default:

```typescript
// i18n/navigation.ts exports locale-aware versions
import { Link } from '@/i18n/navigation';

// Automatically prepends the current locale
<Link href="/dashboard">Dashboard</Link>
// Renders as: /ja/dashboard or /en/dashboard

<Link href="/dashboard/hankos/create">Create Hanko</Link>
// Renders as: /ja/dashboard/hankos/create
```

## Event Handling

```typescript
// Input change
<input onChange={(e) => setText(e.target.value)} />

// Button click
<button onClick={handleSave} disabled={!text.trim()}>Save</button>

// Range slider
<input
  type="range"
  min="-45"
  max="45"
  value={rotation}
  onChange={(e) => setRotation(Number(e.target.value))}
  step="5"
/>

// Form submission (typically via react-hook-form, see forms-and-validation.md)
```

## Conditional Rendering

```typescript
// Logical AND (&&)
{text && <Text ... />}

// Ternary
{session?.user?.name ? `Welcome, ${session.user.name}` : 'Please log in'}

// Early return
if (!canvas || !fabric) return;
```

## List Rendering

```typescript
// Array.map with key
{FONT_OPTIONS.map((f) => (
  <option key={f.value} value={f.value}>
    {t(f.key)}
  </option>
))}

// String splitting for line breaks
{t('heroBody').split('\n').map((line, index) => (
  <span key={index}>
    {line}
    {index === 0 && <br />}
  </span>
))}
```

## Key Files

- `components/Alert.tsx` - Variant-based component with Record pattern
- `components/HankoDesigner.tsx` - Complex client component with canvas, hooks, dynamic imports
- `components/AuthProvider.tsx` - Provider pattern wrapper
- `components/HomePage.tsx` - Full marketing page with i18n
- `components/HankoIcon.tsx` - SVG icon component
- `app/[locale]/layout.tsx` - Server component layout with nested providers
- `app/[locale]/dashboard/page.tsx` - Client page with session and translations

## Best Practices

1. **Server Components by default**: Only mark as `'use client'` when needed
2. **Props interfaces**: Always define TypeScript interfaces for component props
3. **Cleanup effects**: Always return cleanup functions from effects that create subscriptions or instances
4. **Guard async effects**: Check `isMounted` after async operations in effects
5. **Keys for lists**: Always provide stable, unique keys when mapping arrays to elements

## Common Pitfalls

1. **Missing `'use client'`**: Using hooks without the directive causes cryptic server-side errors
2. **Object/array in deps**: Objects and arrays in `useEffect` dependencies cause infinite loops (compare by reference, not value)
3. **State updates on unmounted components**: The `isMounted` guard in HankoDesigner prevents this
4. **Forgetting key prop**: Missing keys in `.map()` renders cause React warnings and potential bugs

## Resources

- [React Documentation](https://react.dev/)
- [React Hooks Reference](https://react.dev/reference/react/hooks)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [NextAuth.js React Hooks](https://next-auth.js.org/getting-started/client)
