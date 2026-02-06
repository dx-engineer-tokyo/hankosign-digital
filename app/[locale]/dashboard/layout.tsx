'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { BarChart3, FileText, LogOut, Plus, Settings, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import HankoIcon from '@/components/HankoIcon';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('dashboardNav');
  const tRoles = useTranslations('roles');

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
      isActive(href)
        ? 'bg-red-50 text-hanko-red'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center text-lg font-semibold text-gray-900">
              <HankoIcon className="mr-2 text-hanko-red" size={24} />
              <span>HankoSign</span>
            </Link>
            <details className="relative">
              <summary className="list-none cursor-pointer">
                <div className="w-10 h-10 rounded-md border border-gray-200 bg-white flex items-center justify-center text-sm font-semibold text-gray-700">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
              </summary>
              <div className="absolute right-0 mt-2 w-52 rounded-md border border-gray-200 bg-white">
                <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
                  {session.user?.name}
                </div>
                <div className="py-2">
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {t('settings')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen border-r border-gray-200">
          <div className="p-4 space-y-1">
            <Link href="/dashboard" className={navLinkClass('/dashboard')}>
              <BarChart3 className="h-4 w-4" />
              {t('dashboard')}
            </Link>
            <Link href="/dashboard/hankos" className={navLinkClass('/dashboard/hankos')}>
              <HankoIcon size={16} />
              {t('myHanko')}
            </Link>
            <Link href="/dashboard/documents" className={navLinkClass('/dashboard/documents')}>
              <FileText className="h-4 w-4" />
              {t('documents')}
            </Link>
            <Link href="/dashboard/settings" className={navLinkClass('/dashboard/settings')}>
              <Settings className="h-4 w-4" />
              {t('settings')}
            </Link>

            {/* Admin-only links */}
            {((session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'SUPER_ADMIN') && (
              <Link href="/dashboard/roles" className={navLinkClass('/dashboard/roles')}>
                <Users className="h-4 w-4" />
                {tRoles('title')}
              </Link>
            )}

            <div className="border-t border-gray-200 my-4"></div>

            <Link
              href="/dashboard/hankos/create"
              className="flex justify-center items-center gap-2 bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-3 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              {t('createHanko')}
            </Link>
            <Link
              href="/dashboard/documents/new"
              className="flex justify-center items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              {t('uploadDoc')}
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
