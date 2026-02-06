'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface HankoDesignerProps {
  onSave: (imageData: string) => void;
  initialText?: string;
  size?: number;
}

const FONT_OPTIONS = [
  { value: 'serif', key: 'fontSerif' },
  { value: 'sans-serif', key: 'fontSansSerif' },
  { value: 'cursive', key: 'fontCursive' },
  { value: 'monospace', key: 'fontMonospace' },
] as const;

export default function HankoDesigner({ onSave, initialText = '', size = 200 }: HankoDesignerProps) {
  const t = useTranslations('hankoDesigner');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const canvasInstanceRef = useRef<any>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [text, setText] = useState(initialText);
  const [font, setFont] = useState('serif');
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const initCanvas = async () => {
      if (!canvasRef.current) return;

      const mod = await import('fabric');
      if (!isMounted) return;

      fabricRef.current = mod;

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
        canvasInstanceRef.current.dispose();
        canvasInstanceRef.current = null;
      }
    };
  }, [size]);

  useEffect(() => {
    const fabric = fabricRef.current;
    if (!canvas || !fabric) return;

    canvas.clear();

    // Draw red circle border
    const circle = new fabric.Circle({
      radius: size / 2 - 10,
      fill: 'transparent',
      stroke: '#D32F2F',
      strokeWidth: 8,
      left: size / 2,
      top: size / 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });

    canvas.add(circle);

    // Add text
    if (text) {
      const hankoText = new fabric.Text(text, {
        fontSize: size / 4,
        fill: '#D32F2F',
        fontFamily: font,
        fontWeight: 'bold',
        left: size / 2,
        top: size / 2,
        originX: 'center',
        originY: 'center',
        angle: rotation,
        selectable: false,
      });

      canvas.add(hankoText);
    }

    canvas.renderAll();
  }, [canvas, text, font, rotation, size]);

  const handleSave = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    onSave(dataURL);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-md text-xs text-gray-500 border border-gray-200">
              {t('preview')}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('textLabel')}
          </label>
          <input
            type="text"
            placeholder={t('textPlaceholder')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4}
          />
          <p className="mt-2 text-xs text-gray-500">{t('maxChars')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fontLabel')}
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {t(f.key)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rotation')}: {rotation}°
          </label>
          <input
            type="range"
            min="-45"
            max="45"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full"
            step="5"
          />
          <div className="w-full flex justify-between text-xs text-gray-500 px-1 mt-1">
            <span>-45°</span>
            <span>0°</span>
            <span>45°</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium w-full"
          disabled={!text.trim()}
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
}
