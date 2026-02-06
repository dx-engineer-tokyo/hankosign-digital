'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Bell, Building2, Globe, Key, User } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const t = useTranslations('settingsPage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form
  const [profileData, setProfileData] = useState({
    name: '',
    nameKana: '',
    email: '',
    department: '',
    position: '',
  });

  // Company form
  const [companyData, setCompanyData] = useState({
    companyName: '',
    corporateNumber: '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications form
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    approvalNotifications: true,
    signatureNotifications: true,
    reminderNotifications: true,
  });

  // Preferences form
  const [preferencesData, setPreferencesData] = useState({
    language: locale,
    timezone: 'Asia/Tokyo',
    dateFormat: 'ja',
  });

  // Load saved notification/preference settings from localStorage
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('hankosign-notifications');
      if (savedNotifications) {
        setNotificationData(JSON.parse(savedNotifications));
      }
      const savedPreferences = localStorage.getItem('hankosign-preferences');
      if (savedPreferences) {
        const prefs = JSON.parse(savedPreferences);
        setPreferencesData({ ...prefs, language: locale });
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [locale]);

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        nameKana: (session.user as any).nameKana || '',
        email: session.user.email || '',
        department: (session.user as any).department || '',
        position: (session.user as any).position || '',
      });
      setCompanyData({
        companyName: (session.user as any).companyName || '',
        corporateNumber: (session.user as any).corporateNumber || '',
      });
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      await update();
      setMessage({ type: 'success', text: t('profileUpdated') || 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: t('profileUpdateFailed') || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });

      if (!res.ok) {
        throw new Error('Failed to update company info');
      }

      await update();
      setMessage({ type: 'success', text: t('companyUpdated') || 'Company info updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: t('companyUpdateFailed') || 'Failed to update company info' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('passwordMismatch') || 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage({ type: 'success', text: t('passwordUpdated') || 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('passwordUpdateFailed') || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });

      if (!res.ok) {
        throw new Error('Failed to save notifications');
      }

      localStorage.setItem('hankosign-notifications', JSON.stringify(notificationData));
      setMessage({ type: 'success', text: t('notificationsSaved') });
    } catch {
      setMessage({ type: 'error', text: t('notificationsSaveFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencesData),
      });

      if (!res.ok) {
        throw new Error('Failed to save preferences');
      }

      localStorage.setItem('hankosign-preferences', JSON.stringify(preferencesData));

      // Switch locale if language changed
      if (preferencesData.language !== locale) {
        router.replace(pathname, { locale: preferencesData.language as 'ja' | 'en' });
        return; // Page will reload with new locale
      }

      setMessage({ type: 'success', text: t('preferencesSaved') });
    } catch {
      setMessage({ type: 'error', text: t('preferencesSaveFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const tabButtonClass = (tab: string) =>
    tab === activeTab
      ? 'bg-hanko-red text-white border border-hanko-red'
      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title') || '設定'}</h1>
        <p className="text-gray-500 mt-2">
          {t('subtitle') || 'アカウント設定を管理します'}
        </p>
      </div>

      {message.text && (
        <div
          className={`border rounded-md px-4 py-2 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${tabButtonClass('profile')}`}
          onClick={() => setActiveTab('profile')}
        >
          <User className="h-4 w-4" /> {t('profile')}
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${tabButtonClass('company')}`}
          onClick={() => setActiveTab('company')}
        >
          <Building2 className="h-4 w-4" /> {t('company')}
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${tabButtonClass('password')}`}
          onClick={() => setActiveTab('password')}
        >
          <Key className="h-4 w-4" /> {t('password')}
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${tabButtonClass('notifications')}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell className="h-4 w-4" /> {t('notifications')}
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${tabButtonClass('preferences')}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Globe className="h-4 w-4" /> {t('preferences')}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-6">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('profileInfo')}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('nameKana')}</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={profileData.nameKana}
                onChange={(e) => setProfileData({ ...profileData, nameKana: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
              <input
                type="email"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('department')}</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('position')}</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                  value={profileData.position}
                  onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'company' && (
          <form onSubmit={handleCompanyUpdate} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('companyInfo')}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('companyName')}</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={companyData.companyName}
                onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('corporateNumber')}</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={companyData.corporateNumber}
                onChange={(e) => setCompanyData({ ...companyData, corporateNumber: e.target.value })}
                placeholder="1234567890123"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('passwordChange')}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('currentPassword')}</label>
              <input
                type="password"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('newPassword')}</label>
              <input
                type="password"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('confirmPassword')}</label>
              <input
                type="password"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? t('changing') : t('changePassword')}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('notificationSettings')}</h2>
            <p className="text-sm text-gray-500">{t('notificationDesc')}</p>

            <label className="flex items-center justify-between text-sm text-gray-700">
              <span>{t('emailNotifications')}</span>
              <input
                type="checkbox"
                className="h-4 w-4 text-hanko-red border-gray-300 rounded"
                checked={notificationData.emailNotifications}
                onChange={(e) => setNotificationData({ ...notificationData, emailNotifications: e.target.checked })}
              />
            </label>

            <label className="flex items-center justify-between text-sm text-gray-700">
              <span>{t('approvalNotifications')}</span>
              <input
                type="checkbox"
                className="h-4 w-4 text-hanko-red border-gray-300 rounded"
                checked={notificationData.approvalNotifications}
                onChange={(e) => setNotificationData({ ...notificationData, approvalNotifications: e.target.checked })}
              />
            </label>

            <label className="flex items-center justify-between text-sm text-gray-700">
              <span>{t('signatureNotifications')}</span>
              <input
                type="checkbox"
                className="h-4 w-4 text-hanko-red border-gray-300 rounded"
                checked={notificationData.signatureNotifications}
                onChange={(e) => setNotificationData({ ...notificationData, signatureNotifications: e.target.checked })}
              />
            </label>

            <label className="flex items-center justify-between text-sm text-gray-700">
              <span>{t('reminderNotifications')}</span>
              <input
                type="checkbox"
                className="h-4 w-4 text-hanko-red border-gray-300 rounded"
                checked={notificationData.reminderNotifications}
                onChange={(e) => setNotificationData({ ...notificationData, reminderNotifications: e.target.checked })}
              />
            </label>

            <div className="flex justify-end">
              <button
                onClick={handleNotificationsSave}
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('languageSettings')}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('displayLanguage')}</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={preferencesData.language}
                onChange={(e) => setPreferencesData({ ...preferencesData, language: e.target.value })}
              >
                <option value="ja">{t('japanese')}</option>
                <option value="en">{t('english')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('timezone')}</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={preferencesData.timezone}
                onChange={(e) => setPreferencesData({ ...preferencesData, timezone: e.target.value })}
              >
                <option value="Asia/Tokyo">{t('jst')}</option>
                <option value="UTC">{t('utc')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('dateFormat')}</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                value={preferencesData.dateFormat}
                onChange={(e) => setPreferencesData({ ...preferencesData, dateFormat: e.target.value })}
              >
                <option value="ja">2024年1月1日</option>
                <option value="en">January 1, 2024</option>
                <option value="iso">2024-01-01</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePreferencesSave}
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
