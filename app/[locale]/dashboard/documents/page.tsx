'use client';

import { useEffect, useState } from 'react';
import { Eye, FileText, Plus, Trash2 } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  status: string;
  templateType?: string;
  createdAt: string;
  signatures: any[];
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  DRAFT: 'border-gray-200 bg-gray-50 text-gray-700',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  IN_PROGRESS: 'border-blue-200 bg-blue-50 text-blue-700',
  COMPLETED: 'border-green-200 bg-green-50 text-green-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  ARCHIVED: 'border-gray-200 bg-gray-50 text-gray-700',
};

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const locale = useLocale();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
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
      const response = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== id));
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

  const getStatusBadge = (status: string) => {
    const labelKey = `statuses.${status}`;
    const label = t.has(labelKey) ? t(labelKey) : status;
    const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.DRAFT;
    return (
      <span className={`inline-flex items-center border rounded-md px-2 py-0.5 text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
          href="/dashboard/documents/new"
          className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('upload')}
        </Link>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md px-4 py-2">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="border border-gray-200 rounded-lg bg-white p-8 text-center">
          <FileText className="text-gray-300 mx-auto mb-4 h-12 w-12" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('emptyTitle')}</h3>
          <p className="text-gray-500 mb-6">
            {t('emptyBody')}
          </p>
          <Link
            href="/dashboard/documents/new"
            className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium inline-block"
          >
            {t('upload')}
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="border-b border-gray-200">
                <th className="text-left font-medium px-4 py-3">{t('columns.title')}</th>
                <th className="text-left font-medium px-4 py-3">{t('columns.type')}</th>
                <th className="text-left font-medium px-4 py-3">{t('columns.status')}</th>
                <th className="text-left font-medium px-4 py-3">{t('columns.signatures')}</th>
                <th className="text-left font-medium px-4 py-3">{t('columns.size')}</th>
                <th className="text-left font-medium px-4 py-3">{t('columns.created')}</th>
                <th className="text-left font-medium px-4 py-3">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-gray-900">{doc.title}</div>
                      {doc.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {doc.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center border border-gray-200 bg-gray-50 text-gray-700 rounded-md px-2 py-0.5 text-xs font-medium">
                      {doc.templateType || t('other')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-700">
                      <HankoIcon className="text-hanko-red" size={16} />
                      <span>{doc.signatures.length}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatFileSize(doc.fileSize)}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(doc.createdAt).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/documents/${doc.id}`}
                        className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-xs font-medium"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="bg-white text-red-700 hover:bg-red-50 border border-red-200 rounded-md px-2 py-1 text-xs font-medium"
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? (
                          <span className="loading-spinner-sm h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
