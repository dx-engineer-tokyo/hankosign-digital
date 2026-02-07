# Canvas & Fabric.js

## What It Is

**Fabric.js** (7.1.0) is a JavaScript canvas library that provides an object model on top of the HTML5 `<canvas>` element. In this project, it powers the hanko designer - the interactive tool where users create their digital seals.

## Why We Use It

- **Object model**: Manipulate shapes and text as objects, not raw pixel operations
- **Export**: Built-in PNG/SVG export for saving hanko images
- **Interactivity**: Built-in selection, dragging, and manipulation (though used in non-interactive mode here)
- **Canvas rendering**: High-quality rendering of circles and text matching traditional hanko appearance

## How It Works Here

### Dynamic Import

Fabric.js is large and only needed on the client, so it's loaded dynamically:

```typescript
// components/HankoDesigner.tsx
useEffect(() => {
  let isMounted = true;

  const initCanvas = async () => {
    if (!canvasRef.current) return;

    const mod = await import('fabric');    // dynamic import
    if (!isMounted) return;                // component may have unmounted

    fabricRef.current = mod;               // store module reference

    const fabricCanvas = new mod.Canvas(canvasRef.current, {
      width: size,
      height: size,
      backgroundColor: 'transparent',
    });

    canvasInstanceRef.current = fabricCanvas;
    setCanvas(fabricCanvas);
  };

  initCanvas();

  return () => {
    isMounted = false;
    if (canvasInstanceRef.current) {
      canvasInstanceRef.current.dispose();  // cleanup canvas resources
    }
  };
}, [size]);
```

### Webpack External

The `canvas` npm package (a Node.js dependency of Fabric.js) is excluded from the client bundle:

```javascript
// next.config.js
webpack: (config) => {
  config.externals = [...(config.externals || []), { canvas: 'canvas' }];
  return config;
},
```

### Hanko Rendering

The designer creates a traditional Japanese hanko appearance:

```typescript
useEffect(() => {
  if (!canvas || !fabric) return;
  canvas.clear();

  // 1. Draw red circle border (hanko outline)
  const circle = new fabric.Circle({
    radius: size / 2 - 10,        // leave padding
    fill: 'transparent',           // hollow circle
    stroke: '#D32F2F',            // hanko red
    strokeWidth: 8,
    left: size / 2,
    top: size / 2,
    originX: 'center',
    originY: 'center',
    selectable: false,             // user can't move/resize it
  });
  canvas.add(circle);

  // 2. Add text (user's name characters)
  if (text) {
    const hankoText = new fabric.Text(text, {
      fontSize: size / 4,
      fill: '#D32F2F',            // same red as border
      fontFamily: font,            // user-selected font
      fontWeight: 'bold',
      left: size / 2,
      top: size / 2,
      originX: 'center',
      originY: 'center',
      angle: rotation,             // user-controlled rotation
      selectable: false,
    });
    canvas.add(hankoText);
  }

  canvas.renderAll();
}, [canvas, text, font, rotation, size]);
```

### Export to PNG

When the user saves, the canvas is exported as a high-resolution PNG data URL:

```typescript
const handleSave = () => {
  if (!canvas) return;

  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,            // maximum quality
    multiplier: 2,         // 2x resolution for crisp display
  });

  onSave(dataURL);         // passes "data:image/png;base64,..." to parent
};
```

### User Controls

The designer provides three controls:

1. **Text input**: Max 4 characters (typical for Japanese seals showing surname)
2. **Font selector**: serif, sans-serif, cursive, monospace
3. **Rotation slider**: -45 to +45 degrees in 5-degree steps

```typescript
const FONT_OPTIONS = [
  { value: 'serif', key: 'fontSerif' },
  { value: 'sans-serif', key: 'fontSansSerif' },
  { value: 'cursive', key: 'fontCursive' },
  { value: 'monospace', key: 'fontMonospace' },
] as const;
```

## Component Architecture

```
HankoDesigner (client component)
├── Canvas (Fabric.js instance)
│   ├── Circle (red hanko border)
│   └── Text (user's name)
├── Text Input (controlled, max 4 chars)
├── Font Select (dropdown)
├── Rotation Slider (range input)
└── Save Button (exports PNG)
```

## Key Files

- `components/HankoDesigner.tsx` - The hanko designer component
- `next.config.js` - Canvas external configuration
- `app/api/hankos/route.ts` - Receives the exported PNG data URL

## Best Practices

1. **Dynamic import**: Load Fabric.js only when the component mounts, not at bundle time
2. **Cleanup on unmount**: Always `dispose()` the Fabric canvas to prevent memory leaks
3. **isMounted guard**: Prevent state updates after component unmounts
4. **Non-selectable objects**: Set `selectable: false` since the hanko is rendered programmatically, not manually dragged

## Common Pitfalls

1. **Missing canvas external**: Without the webpack external config, the build fails because `canvas` (Node.js package) can't compile for the browser
2. **Memory leaks**: Forgetting to `dispose()` the Fabric canvas causes memory leaks on navigation
3. **Server-side rendering**: Fabric.js uses browser APIs and must only run on the client (`'use client'` + dynamic import)

## Resources

- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Fabric.js GitHub](https://github.com/fabricjs/fabric.js)
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
