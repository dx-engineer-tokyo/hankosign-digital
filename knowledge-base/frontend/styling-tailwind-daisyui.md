# Styling: Tailwind CSS & DaisyUI

## What It Is

**Tailwind CSS** (3.4.1) is a utility-first CSS framework - instead of writing custom CSS classes, you compose styles from predefined utility classes directly in your HTML/JSX. **DaisyUI** (4.6.1) is a Tailwind plugin that adds pre-built component classes (buttons, cards, badges, etc.).

## Why We Use It

- **Rapid development**: No context-switching between CSS files and components
- **Consistent design**: Constrained design tokens (colors, spacing, typography)
- **DaisyUI theming**: Custom "hankosign" theme with brand colors
- **No CSS files**: All styles are inline, reducing CSS bundle size and eliminating dead CSS
- **Japanese typography**: Configured with Noto Sans JP font family

## How It Works Here

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hanko: {
          red: '#D32F2F',      // primary brand red (hanko ink color)
          ink: '#B71C1C',      // darker red (hover states)
          light: '#FFCDD2',    // light pink (backgrounds)
        },
      },
      fontFamily: {
        japanese: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      hankosign: {
        primary: '#D32F2F',
        secondary: '#1976D2',
        accent: '#FFA726',
        neutral: '#424242',
        'base-100': '#FFFFFF',
        'base-200': '#F5F5F5',
        'base-300': '#E0E0E0',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
      },
    }],
  },
};
```

### Custom Colors Usage

```html
<!-- Brand colors -->
<span class="text-hanko-red">Primary red text</span>
<button class="bg-hanko-red hover:bg-hanko-ink">Red button with darker hover</button>
<div class="bg-hanko-light">Light pink background</div>

<!-- DaisyUI semantic colors -->
<span class="text-primary">Uses hankosign theme primary (#D32F2F)</span>
<span class="text-success">Green success text</span>
<span class="text-error">Red error text</span>
```

### Common Patterns in This Project

**Buttons:**
```html
<!-- Primary action button (hanko-red) -->
<button class="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium">
  Save
</button>

<!-- Secondary button (outlined) -->
<button class="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium">
  Cancel
</button>

<!-- Disabled state -->
<button disabled class="..." disabled={!text.trim()}>
  Save
</button>
```

**Cards:**
```html
<div class="border border-gray-200 rounded-lg bg-white p-6">
  <h2 class="text-lg font-semibold text-gray-900">Card Title</h2>
  <p class="text-sm text-gray-600">Card content</p>
</div>
```

**Form inputs:**
```html
<input
  type="text"
  class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
/>
```

**Stat cards (dashboard):**
```html
<div class="border border-gray-200 rounded-lg bg-white p-4">
  <div class="flex items-center gap-2 text-gray-700">
    <Icon class="text-hanko-red" />
    <span class="text-sm">Label</span>
  </div>
  <div class="text-2xl font-semibold text-hanko-red mt-2">0</div>
  <div class="text-sm text-gray-500">Description</div>
</div>
```

**Badge classes (DaisyUI, from lib/utils.ts):**
```javascript
const colors = {
  DRAFT: 'badge-ghost',
  PENDING: 'badge-warning',
  IN_PROGRESS: 'badge-info',
  COMPLETED: 'badge-success',
  REJECTED: 'badge-error',
  ARCHIVED: 'badge-neutral',
};
```

### Alert Component Styles

```typescript
// components/Alert.tsx - variant-based styling
const variantStyles = {
  error: { container: 'border-red-200 bg-red-50 text-red-700' },
  success: { container: 'border-green-200 bg-green-50 text-green-700' },
  warning: { container: 'border-amber-200 bg-amber-50 text-amber-700' },
  info: { container: 'border-blue-200 bg-blue-50 text-blue-700' },
};
```

### Responsive Design

Tailwind uses mobile-first breakpoints with prefix modifiers:

```html
<!-- Mobile: single column, Desktop: 4 columns -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6">

<!-- Mobile: stack vertically, Desktop: side by side -->
<div class="flex flex-col sm:flex-row gap-3">

<!-- Mobile: smaller text, Desktop: larger -->
<h1 class="text-4xl sm:text-5xl font-bold">

<!-- Mobile: full width, Desktop: 2 columns -->
<div class="grid md:grid-cols-2 gap-4">
```

### Dark Mode

Not implemented. The project uses a light theme only via the `hankosign` DaisyUI theme.

## Key Files

- `tailwind.config.js` - Theme, colors, fonts, DaisyUI configuration
- `postcss.config.js` - PostCSS plugins (tailwindcss + autoprefixer)
- `components/Alert.tsx` - Variant-based Tailwind styling pattern
- `components/HomePage.tsx` - Full responsive page layout
- `lib/utils.ts` - DaisyUI badge class mapping

## Best Practices

1. **Use custom hanko colors** for brand elements, standard gray palette for neutrals
2. **Mobile-first**: Write base styles for mobile, add breakpoint prefixes for larger screens
3. **Utility composition**: Keep class strings readable - line break complex ones
4. **DaisyUI for standard components**: Use `badge-*`, `btn-*` when they match the design

## Common Pitfalls

1. **Purging issues**: If a class isn't in `content` paths, it gets removed. Dynamic class names (like `badge-${status}`) won't work - use full class strings
2. **CSS specificity**: Tailwind utilities have equal specificity. Order in the class string doesn't determine priority
3. **Custom colors vs DaisyUI**: `text-hanko-red` (custom) and `text-primary` (DaisyUI) both resolve to `#D32F2F` but via different systems

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
