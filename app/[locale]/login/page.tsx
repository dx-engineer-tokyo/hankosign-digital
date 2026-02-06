'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import HankoIcon from '@/components/HankoIcon';
import Alert from '@/components/Alert';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(t('errorDefault'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-gray-200 rounded-lg bg-white p-6">
        <div className="flex justify-center mb-6">
          <HankoIcon className="text-hanko-red" size={48} />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-center text-gray-500 mb-6">
          {t('subtitle')}
        </p>

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
            <input
              type="password"
              placeholder={t('passwordPlaceholder')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2">
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                {t('forgot')}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium w-full text-center"
            disabled={isLoading}
          >
            {isLoading ? t('loading') : t('submit')}
          </button>
        </form>

        <div className="border-t border-gray-200 my-6"></div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-hanko-red hover:text-hanko-ink font-medium">
              {t('register')}
            </Link>
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <>
            <div className="border-t border-gray-200 my-6"></div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
              <p className="font-semibold mb-3 text-center text-gray-900">Quick Login (Development Only)</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center border border-red-200 bg-red-50 text-red-700 rounded-md px-2 py-0.5 text-xs font-medium">SUPER_ADMIN</span>
                  <button
                    onClick={() => {
                      setEmail('admin@hankosign.jp');
                      setPassword('Admin@123456');
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-xs font-medium"
                  >
                    admin@hankosign.jp
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center border border-amber-200 bg-amber-50 text-amber-700 rounded-md px-2 py-0.5 text-xs font-medium">ADMIN</span>
                  <button
                    onClick={() => {
                      setEmail('manager@hankosign.jp');
                      setPassword('Manager@123456');
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-xs font-medium"
                  >
                    manager@hankosign.jp
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center border border-blue-200 bg-blue-50 text-blue-700 rounded-md px-2 py-0.5 text-xs font-medium">USER</span>
                  <button
                    onClick={() => {
                      setEmail('user1@hankosign.jp');
                      setPassword('User@123456');
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-xs font-medium"
                  >
                    user1@hankosign.jp
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center border border-blue-200 bg-blue-50 text-blue-700 rounded-md px-2 py-0.5 text-xs font-medium">USER</span>
                  <button
                    onClick={() => {
                      setEmail('user2@hankosign.jp');
                      setPassword('User@123456');
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-xs font-medium"
                  >
                    user2@hankosign.jp
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center border border-green-200 bg-green-50 text-green-700 rounded-md px-2 py-0.5 text-xs font-medium">EXTERNAL</span>
                  <button
                    onClick={() => {
                      setEmail('external@example.com');
                      setPassword('External@123456');
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-xs font-medium"
                  >
                    external@example.com
                  </button>
                </div>
              </div>
              <p className="text-center mt-3 text-[10px] text-gray-500">
                Click an email to auto-fill credentials
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
