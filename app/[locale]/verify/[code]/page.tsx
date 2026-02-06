'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, FileText, ShieldCheck, XCircle } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Signature {
  id: string;
  timestamp: string;
  isValid: boolean;
  user: {
    name: string;
    email: string;
    position?: string;
  };
  hanko: {
    name: string;
    type: string;
  };
}

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  status: string;
  verificationCode: string;
  createdAt: string;
  completedAt?: string;
  createdBy: {
    name: string;
    email: string;
    companyName?: string;
  };
  signatures: Signature[];
}

const STATUS_STYLES: Record<string, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  neutral: 'border-gray-200 bg-gray-50 text-gray-700',
};

const STATUS_META: Record<string, { icon: any; tone: string; key: string }> = {
  COMPLETED: { icon: CheckCircle2, tone: 'success', key: 'statusCompleted' },
  IN_PROGRESS: { icon: HankoIcon, tone: 'info', key: 'statusInProgress' },
  PENDING: { icon: FileText, tone: 'warning', key: 'statusPending' },
  DRAFT: { icon: FileText, tone: 'neutral', key: 'statusDraft' },
};

export default function VerifyPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('verify');
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const verifyDocument = useCallback(async (code: string) => {
    try {
      const response = await fetch(`/api/verify/${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorTitle'));
      }

      setDocument(data.document);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (params.code) {
      verifyDocument(params.code as string);
    }
  }, [params.code, verifyDocument]);

  const getHankoTypeLabel = (type: string) => {
    const key = `hankoTypes.${type}`;
    return t.has(key) ? t(key) : type;
  };

  const getStatusInfo = (status: string) => {
    const meta = STATUS_META[status];
    if (!meta) return { tone: 'neutral', label: status, icon: FileText };
    return { ...meta, label: t(meta.key) };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const statusInfo = document ? getStatusInfo(document.status) : null;
  const statusStyle = STATUS_STYLES[statusInfo?.tone || 'neutral'];

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <ShieldCheck className="text-hanko-red mx-auto mb-4 h-12 w-12" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{t('portal')}</h1>
          <p className="text-lg text-gray-500">HankoSign Digital</p>
        </div>

        {error ? (
          <div className="border border-gray-200 rounded-lg bg-white p-6 text-center">
            <XCircle className="text-red-600 mx-auto mb-4 h-12 w-12" />
            <h2 className="text-2xl font-semibold text-gray-900">{t('errorTitle')}</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <div className="mt-6">
              <Link
                href="/"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
              >
                {t('backHome')}
              </Link>
            </div>
          </div>
        ) : document ? (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`border rounded-md p-4 ${statusStyle}`}>
              <div className="flex items-center gap-4">
                {statusInfo?.icon && <statusInfo.icon className="h-6 w-6" />}
                <div>
                  <h3 className="font-semibold text-lg">{statusInfo?.label}</h3>
                  {document.status === 'COMPLETED' && (
                    <p className="text-sm">
                      {t('completedNote')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('info')}</h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">{t('title')}</p>
                  <p className="font-semibold text-gray-900 text-lg">{document.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('file')}</p>
                  <p className="font-mono text-sm text-gray-900">{document.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('author')}</p>
                  <p className="font-semibold text-gray-900">{document.createdBy.name}</p>
                  {document.createdBy.companyName && (
                    <p className="text-sm text-gray-500">{document.createdBy.companyName}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('code')}</p>
                  <p className="font-mono text-sm font-bold text-hanko-red">
                    {document.verificationCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('createdAt')}</p>
                  <p className="text-gray-900">{new Date(document.createdAt).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}</p>
                </div>
                {document.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500">{t('completedAt')}</p>
                    <p className="text-gray-900">{new Date(document.completedAt).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}</p>
                  </div>
                )}
              </div>

              {document.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{t('description')}</p>
                  <p className="mt-1 text-gray-900">{document.description}</p>
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('signatures')}</h2>
              <p className="text-gray-500 mb-4">
                {t('signatureCount', { count: document.signatures.length })}
              </p>

              {document.signatures.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('noSignatures')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {document.signatures.map((sig, index) => (
                    <div key={sig.id} className="border border-gray-200 rounded-lg bg-gray-50">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="border border-gray-200 rounded-md bg-white w-12 h-12 flex items-center justify-center text-sm font-semibold text-gray-700">
                              {index + 1}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{sig.user.name}</h3>
                                {sig.user.position && (
                                  <p className="text-sm text-gray-600">{sig.user.position}</p>
                                )}
                              </div>
                              {sig.isValid ? (
                                <span className="inline-flex items-center border border-green-200 bg-green-50 text-green-700 rounded-md px-2 py-0.5 text-xs font-medium gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t('valid')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center border border-red-200 bg-red-50 text-red-700 rounded-md px-2 py-0.5 text-xs font-medium gap-1">
                                  <XCircle className="h-3 w-3" />
                                  {t('invalid')}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                              <div>
                                <span className="text-gray-500">{t('hankoType')}</span>{' '}
                                <span className="font-semibold">
                                  {sig.hanko.name} ({getHankoTypeLabel(sig.hanko.type)})
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">{t('signedAt')}</span>{' '}
                                <span>{new Date(sig.timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legal Notice */}
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('legal')}</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>{t('legal1')}</p>
                <p>{t('legal2')}</p>
                <p>{t('legal3')}</p>
                <p className="mt-4 text-gray-500">
                  {t('legalNote')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium"
              >
                {t('backHome')}
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
              >
                {t('print')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
