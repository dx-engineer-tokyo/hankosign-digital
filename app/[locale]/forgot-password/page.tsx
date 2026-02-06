'use client';

import { useState } from 'react';
import HankoIcon from '@/components/HankoIcon';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send reset email');
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
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

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {t('title') || 'パスワードをお忘れですか？'}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {t('subtitle') || '登録されているメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。'}
        </p>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="border border-green-200 bg-green-50 text-green-700 text-sm rounded-md px-3 py-2">
              {t('success') || 'パスワードリセット用のメールを送信しました。受信ボックスをご確認ください。'}
            </div>
            <Link
              href="/login"
              className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium w-full text-center block"
            >
              {t('backToLogin') || 'ログイン画面に戻る'}
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email') || 'メールアドレス'}
                </label>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder') || 'email@example.com'}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium w-full"
                disabled={isLoading}
              >
                {isLoading ? t('loading') || '送信中...' : t('submit') || 'リセットリンクを送信'}
              </button>
            </form>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="text-center">
              <Link href="/login" className="text-hanko-red hover:text-hanko-ink text-sm font-medium">
                {t('backToLogin') || 'ログイン画面に戻る'}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
