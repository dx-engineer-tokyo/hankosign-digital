'use client';

import { useState } from 'react';
import HankoIcon from '@/components/HankoIcon';
import Alert from '@/components/Alert';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('register');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nameKana: '',
    companyName: '',
    department: '',
    position: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('errorMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          nameKana: formData.nameKana || undefined,
          companyName: formData.companyName || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorDefault'));
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border border-gray-200 rounded-lg bg-white p-6">
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
              <input
                type="text"
                name="name"
                placeholder={t('namePlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('nameKana')}</label>
              <input
                type="text"
                name="nameKana"
                placeholder={t('nameKanaPlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={formData.nameKana}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
            <input
              type="email"
              name="email"
              placeholder={t('emailPlaceholder')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
              <input
                type="password"
                name="password"
                placeholder={t('passwordPlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('confirm')}</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('confirmPlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 text-sm font-medium text-gray-700">
            {t('companySection')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('companyName')}</label>
            <input
              type="text"
              name="companyName"
              placeholder={t('companyPlaceholder')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('department')}</label>
              <input
                type="text"
                name="department"
                placeholder={t('departmentPlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('position')}</label>
              <input
                type="text"
                name="position"
                placeholder={t('positionPlaceholder')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={formData.position}
                onChange={handleChange}
              />
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
            {t('haveAccount')}{' '}
            <Link href="/login" className="text-hanko-red hover:text-hanko-ink font-medium">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
