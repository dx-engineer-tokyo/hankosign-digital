'use client';

import { useState } from 'react';
import HankoDesigner from '@/components/HankoDesigner';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export default function CreateHankoPage() {
  const router = useRouter();
  const t = useTranslations('hankosCreate');
  const [name, setName] = useState('');
  const [type, setType] = useState<'MITOMEIN' | 'GINKOIN' | 'JITSUIN'>('MITOMEIN');
  const [imageData, setImageData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hankoTypes = [
    { value: 'MITOMEIN', label: t('typeMitomeinLabel'), description: t('typeMitomeinDesc') },
    { value: 'GINKOIN', label: t('typeGinkoinLabel'), description: t('typeGinkoinDesc') },
    { value: 'JITSUIN', label: t('typeJitsuinLabel'), description: t('typeJitsuinDesc') },
  ];

  const handleSaveImage = (data: string) => {
    setImageData(data);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t('errorName'));
      return;
    }

    if (!imageData) {
      setError(t('errorDesign'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/hankos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
          imageData,
          size: 60,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorDefault'));
      }

      router.push('/dashboard/hankos');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/hankos"
          className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md p-2"
          aria-label={t('cancel')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{t('infoTitle')}</h2>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('nameLabel')}
              </label>
              <input
                type="text"
                placeholder={t('namePlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <span className="block text-sm font-medium text-gray-700 mb-2">{t('typeLabel')}</span>
              <div className="space-y-2">
                {hankoTypes.map((ht) => (
                  <label key={ht.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="hanko-type"
                      className="mt-1 h-4 w-4 text-hanko-red border-gray-300 focus:ring-hanko-red"
                      value={ht.value}
                      checked={type === ht.value}
                      onChange={(e) => setType(e.target.value as any)}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">{ht.label}</span>
                      <p className="text-sm text-gray-500">{ht.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {type === 'JITSUIN' && (
              <div className="mt-4 border border-blue-200 bg-blue-50 text-blue-700 text-sm rounded-md px-3 py-2">
                <p className="font-semibold">{t('jitsuinTitle')}</p>
                <p className="text-sm">{t('jitsuinBody')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Designer */}
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('design')}</h2>
          <div className="mt-4">
            <HankoDesigner onSave={handleSaveImage} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href="/dashboard/hankos"
          className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium"
        >
          {t('cancel')}
        </Link>
        <button
          onClick={handleSubmit}
          className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
          disabled={isLoading || !imageData}
        >
          {isLoading ? t('loading') : t('submit')}
        </button>
      </div>
    </div>
  );
}
