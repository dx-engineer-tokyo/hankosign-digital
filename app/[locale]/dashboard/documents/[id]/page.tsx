'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, FileText, QrCode } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Hanko {
  id: string;
  name: string;
  type: string;
  imageData: string;
}

interface Signature {
  id: string;
  positionX: number;
  positionY: number;
  page: number;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
  hanko: Hanko;
}

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  status: string;
  verificationCode: string;
  templateType?: string;
  createdAt: string;
  signatures: Signature[];
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  DRAFT: 'border-gray-200 bg-gray-50 text-gray-700',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  IN_PROGRESS: 'border-blue-200 bg-blue-50 text-blue-700',
  COMPLETED: 'border-green-200 bg-green-50 text-green-700',
};

export default function DocumentDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('documentDetail');
  const [document, setDocument] = useState<Document | null>(null);
  const [hankos, setHankos] = useState<Hanko[]>([]);
  const [selectedHanko, setSelectedHanko] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState('');

  const fetchDocument = useCallback(async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      const doc = data.documents?.find((d: Document) => d.id === params.id);
      setDocument(doc || null);
    } catch (error) {
      console.error('Failed to fetch document:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const fetchHankos = useCallback(async () => {
    try {
      const response = await fetch('/api/hankos');
      const data = await response.json();
      setHankos(data.hankos || []);
      if (data.hankos?.length > 0) {
        setSelectedHanko(data.hankos[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch hankos:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocument();
    fetchHankos();
  }, [fetchDocument, fetchHankos]);

  const handleSign = async () => {
    if (!selectedHanko || !document) return;

    setIsSigning(true);
    setError('');
    try {
      const response = await fetch('/api/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          hankoId: selectedHanko,
          positionX: 100,
          positionY: 300,
          page: 1,
        }),
      });

      if (response.ok) {
        await fetchDocument();
      } else {
        const data = await response.json();
        setError(data.error || t('signFailed'));
      }
    } catch {
      setError(t('signFailed'));
    } finally {
      setIsSigning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: t('statuses.DRAFT'),
      PENDING: t('statuses.PENDING'),
      IN_PROGRESS: t('statuses.IN_PROGRESS'),
      COMPLETED: t('statuses.COMPLETED'),
    };

    const label = labels[status] || status;
    const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.DRAFT;

    return (
      <span className={`inline-flex items-center border rounded-md px-2 py-0.5 text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };

  const getHankoTypeLabel = (type: string) => {
    const key = `hankoTypes.${type}`;
    return t.has(key) ? t(key) : type;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="border border-gray-200 rounded-lg bg-white p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900">{t('notFound')}</h3>
        <Link
          href="/dashboard/documents"
          className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium inline-block mt-4"
        >
          {t('backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/documents"
          className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md p-2"
          aria-label={t('backToList')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{document.title}</h1>
          <p className="text-gray-500">{document.fileName}</p>
        </div>
        {getStatusBadge(document.status)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{t('preview')}</h2>
            <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-8 min-h-[600px] flex items-center justify-center mt-4">
              <div className="text-center text-gray-500">
                <FileText className="text-gray-400 mx-auto mb-4 h-12 w-12" />
                <p>{t('previewSoon')}</p>
                <p className="text-sm mt-2">{t('previewNote')}</p>
              </div>

              {/* Signature overlays */}
              {document.signatures.map((sig) => (
                <div
                  key={sig.id}
                  className="absolute"
                  style={{
                    left: `${sig.positionX}px`,
                    top: `${sig.positionY}px`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sig.hanko.imageData}
                    alt={sig.user.name}
                    width={64}
                    height={64}
                    title={`${sig.user.name} - ${new Date(sig.timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signing Panel */}
        <div className="space-y-6">
          {/* Document Info */}
          <div className="border border-gray-200 rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('info')}</h3>
            <div className="space-y-2 text-sm text-gray-700 mt-3">
              {document.templateType && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('type')}</span>
                  <span className="font-semibold">{document.templateType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{t('createdAt')}</span>
                <span>{new Date(document.createdAt).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('verifyCode')}</span>
                <span className="font-mono text-xs">{document.verificationCode}</span>
              </div>
            </div>

            {document.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">{document.description}</p>
              </div>
            )}

            <div className="border-t border-gray-200 my-4"></div>

            <Link
              href={`/verify/${document.verificationCode}`}
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium inline-flex items-center gap-2"
              target="_blank"
            >
              <QrCode className="h-4 w-4" />
              {t('verifyPage')}
            </Link>
          </div>

          {/* Signatures */}
          <div className="border border-gray-200 rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('signatures')}</h3>
            {document.signatures.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('noSignatures')}
              </p>
            ) : (
              <div className="space-y-3 mt-3">
                {document.signatures.map((sig) => (
                  <div key={sig.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-md bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sig.hanko.imageData}
                      alt={sig.user.name}
                      width={48}
                      height={48}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{sig.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sig.timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}
                      </p>
                    </div>
                    <Check className="text-green-600 h-4 w-4" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sign with Hanko */}
          <div className="border border-gray-200 rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('signWithHanko')}</h3>

            {error && (
              <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mt-3">
                {error}
              </div>
            )}

            {hankos.length === 0 ? (
              <div className="text-sm text-gray-700 mt-3">
                <p className="mb-3">{t('noHanko')}</p>
                <Link
                  href="/dashboard/hankos/create"
                  className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium inline-block"
                >
                  {t('createHanko')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4 mt-3">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                  value={selectedHanko}
                  onChange={(e) => setSelectedHanko(e.target.value)}
                >
                  {hankos.map((hanko) => (
                    <option key={hanko.id} value={hanko.id}>
                      {hanko.name} ({getHankoTypeLabel(hanko.type)})
                    </option>
                  ))}
                </select>

                {selectedHanko && (() => {
                  const selected = hankos.find((h) => h.id === selectedHanko);
                  if (!selected) return null;

                  return (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected.imageData}
                        alt="Selected hanko"
                        width={80}
                        height={80}
                      />
                    </div>
                  );
                })()}

                <button
                  onClick={handleSign}
                  className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium w-full flex items-center justify-center gap-2"
                  disabled={isSigning || !selectedHanko}
                >
                  {isSigning ? (
                    <>
                      <span className="loading-spinner-sm" aria-hidden="true"></span>
                      {t('signing')}
                    </>
                  ) : (
                    <>
                      <HankoIcon size={16} />
                      {t('sign')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
