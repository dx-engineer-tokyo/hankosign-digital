'use client';

import { useSession } from 'next-auth/react';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function DashboardPage() {
  const { data: session } = useSession();
  const t = useTranslations('dashboardOverview');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-500">
          {t('welcome')}{session?.user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <HankoIcon className="text-hanko-red" size={20} />
            <span className="text-sm">{t('myHanko')}</span>
          </div>
          <div className="text-2xl font-semibold text-hanko-red mt-2">0</div>
          <div className="text-sm text-gray-500">{t('myHankoDesc')}</div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <FileText className="h-5 w-5 text-hanko-red" />
            <span className="text-sm">{t('documents')}</span>
          </div>
          <div className="text-2xl font-semibold text-hanko-red mt-2">0</div>
          <div className="text-sm text-gray-500">{t('documentsDesc')}</div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-sm">{t('pending')}</span>
          </div>
          <div className="text-2xl font-semibold text-amber-700 mt-2">0</div>
          <div className="text-sm text-gray-500">{t('pendingDesc')}</div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm">{t('completed')}</span>
          </div>
          <div className="text-2xl font-semibold text-green-700 mt-2">0</div>
          <div className="text-sm text-gray-500">{t('completedDesc')}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('quickActions')}</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Link
            href="/dashboard/hankos/create"
            className="bg-hanko-red justify-center text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            <HankoIcon size={16} />
            {t('createHanko')}
          </Link>
          <Link
            href="/dashboard/documents/new"
            className="bg-white justify-center text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {t('uploadDoc')}
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('activity')}</h2>
        <div className="text-center py-12 text-gray-500">
          <p>{t('activityEmpty')}</p>
          <p className="text-sm mt-2">{t('activityHint')}</p>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('gettingStarted')}</h2>
        <ol className="list-decimal list-inside space-y-2 mt-4 text-gray-700">
          <li>{t('step1')}</li>
          <li>{t('step2')}</li>
          <li>{t('step3')}</li>
          <li>{t('step4')}</li>
          <li>{t('step5')}</li>
        </ol>
        <div className="flex justify-end mt-4">
          <Link
            href="/help"
            className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
          >
            {t('help')}
          </Link>
        </div>
      </div>
    </div>
  );
}
