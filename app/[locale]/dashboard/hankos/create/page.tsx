'use client';

import { useState } from 'react';
import HankoDesigner from '@/components/HankoDesigner';
import Alert from '@/components/Alert';
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
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; imageData?: string }>({});

  const hankoTypes = [
    { value: 'MITOMEIN', label: t('typeMitomeinLabel'), description: t('typeMitomeinDesc') },
    { value: 'GINKOIN', label: t('typeGinkoinLabel'), description: t('typeGinkoinDesc') },
    { value: 'JITSUIN', label: t('typeJitsuinLabel'), description: t('typeJitsuinDesc') },
  ];

  const handleNameChange = (value: string) => {
    setName(value);
    if (fieldErrors.name && value.trim()) {
      setFieldErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleSaveImage = (data: string) => {
    setImageData(data);
    if (fieldErrors.imageData && data) {
      setFieldErrors(prev => ({ ...prev, imageData: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; imageData?: string } = {};

    if (!name.trim()) {
      errors.name = t('errorName');
    }

    if (!imageData) {
      errors.imageData = t('errorDesign');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('');
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

      {error && <Alert variant="error">{error}</Alert>}

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
                className={`border rounded-md px-3 py-2 text-sm w-full focus:ring-1 ${
                  fieldErrors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-hanko-red focus:ring-hanko-red'
                }`}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
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
              <div className="mt-4">
                <Alert variant="info">
                  <p className="font-semibold">{t('jitsuinTitle')}</p>
                  <p className="text-sm mt-1">{t('jitsuinBody')}</p>
                </Alert>
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
          {fieldErrors.imageData && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.imageData}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href="/dashboard/hankos"
          className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-center"
        >
          {t('cancel')}
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          {isLoading ? t('loading') : t('submit')}
        </button>
      </div>
    </div>
  );
}
