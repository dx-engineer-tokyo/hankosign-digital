'use client';

import { useState } from 'react';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

const TEMPLATE_OPTIONS = [
  { value: '', key: 'templateOther' },
  { value: '契約書', key: 'templateContract' },
  { value: '請求書', key: 'templateInvoice' },
  { value: '見積書', key: 'templateQuote' },
  { value: '稟議書', key: 'templateRingi' },
  { value: '発注書', key: 'templatePurchaseOrder' },
] as const;

export default function NewDocumentPage() {
  const router = useRouter();
  const t = useTranslations('documentsNew');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError(t('errorFile'));
      return;
    }

    if (!title.trim()) {
      setError(t('errorTitle'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) formData.append('description', description);
      if (templateType) formData.append('templateType', templateType);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorDefault'));
      }

      router.push('/dashboard/documents');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/documents"
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('fileSelect')}</h2>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fileLabel')}
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
            />
            <p className="mt-2 text-xs text-gray-500">
              {t('fileHelp')}
            </p>
          </div>

          {file && (
            <div className="mt-4 border border-blue-200 bg-blue-50 text-blue-700 text-sm rounded-md px-3 py-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-xs">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('docInfo')}</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('docTitle')}
              </label>
              <input
                type="text"
                placeholder={t('docTitlePlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('docType')}
              </label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
              >
                {TEMPLATE_OPTIONS.map((tpl) => (
                  <option key={tpl.value} value={tpl.value}>
                    {t(tpl.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')}
              </label>
              <textarea
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full h-24 focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                placeholder={t('descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/documents"
            className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium flex items-center gap-2"
            disabled={isLoading || !file}
          >
            {!isLoading && <Upload className="h-4 w-4" />}
            {isLoading ? t('uploading') : t('upload')}
          </button>
        </div>
      </form>
    </div>
  );
}
