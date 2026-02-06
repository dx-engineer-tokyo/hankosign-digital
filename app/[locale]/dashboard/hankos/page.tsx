'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import Alert from '@/components/Alert';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Hanko {
  id: string;
  name: string;
  type: string;
  imageData: string;
  isRegistered: boolean;
  createdAt: string;
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  MITOMEIN: 'border-blue-200 bg-blue-50 text-blue-700',
  GINKOIN: 'border-amber-200 bg-amber-50 text-amber-700',
  JITSUIN: 'border-red-200 bg-red-50 text-red-700',
};

export default function HankosPage() {
  const t = useTranslations('hankos');
  const locale = useLocale();
  const [hankos, setHankos] = useState<Hanko[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHankos();
  }, []);

  const fetchHankos = async () => {
    try {
      const response = await fetch('/api/hankos');
      const data = await response.json();
      setHankos(data.hankos || []);
    } catch (error) {
      console.error('Failed to fetch hankos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    setDeletingId(id);
    setError('');
    try {
      const response = await fetch(`/api/hankos?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHankos(hankos.filter((h) => h.id !== id));
      } else {
        const data = await response.json();
        setError(data.error || t('deleteFailed'));
      }
    } catch {
      setError(t('deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    const key = `types.${type}`;
    return t.has(key) ? t(key) : type;
  };

  const getTypeBadgeStyle = (type: string) => {
    return TYPE_BADGE_STYLES[type] || 'border-gray-200 bg-gray-50 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/hankos/create"
          className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('create')}
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {hankos.length === 0 ? (
        <div className="border border-gray-200 rounded-lg bg-white p-8 text-center">
          <HankoIcon className="text-gray-300 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('emptyTitle')}</h3>
          <p className="text-gray-500 mb-6">
            {t('emptyBody')}
          </p>
          <Link
            href="/dashboard/hankos/create"
            className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            {t('createButton')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hankos.map((hanko) => (
            <div key={hanko.id} className="border border-gray-200 rounded-lg bg-white p-6">
              <div className="flex justify-between items-start">
                <span
                  className={`inline-flex items-center border rounded-md px-2 py-0.5 text-xs font-medium ${getTypeBadgeStyle(hanko.type)}`}
                >
                  {getTypeLabel(hanko.type)}
                </span>
                <button
                  onClick={() => handleDelete(hanko.id)}
                  className="bg-white text-red-700 hover:bg-red-50 border border-red-200 rounded-md p-1"
                  aria-label={t('confirmDelete')}
                  disabled={deletingId === hanko.id}
                >
                  {deletingId === hanko.id ? (
                    <span className="loading-spinner-sm h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex justify-center my-4">
                <div className="w-32 h-32 flex items-center justify-center border border-gray-200 rounded-md bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hanko.imageData}
                    alt={hanko.name}
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{hanko.name}</h3>

              <div className="text-sm text-gray-500 mt-1">
                {t('createdAt')}{new Date(hanko.createdAt).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}
              </div>

              {hanko.isRegistered && (
                <div className="inline-flex items-center border border-green-200 bg-green-50 text-green-700 rounded-md px-2 py-0.5 text-xs font-medium gap-1 mt-3">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('registered')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
