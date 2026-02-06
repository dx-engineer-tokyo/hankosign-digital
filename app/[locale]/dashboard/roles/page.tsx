'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Crown, Search, Shield, User, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  companyName?: string;
  department?: string;
  position?: string;
  createdAt: string;
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  SUPER_ADMIN: 'border-red-200 bg-red-50 text-red-700',
  ADMIN: 'border-amber-200 bg-amber-50 text-amber-700',
  USER: 'border-blue-200 bg-blue-50 text-blue-700',
};

export default function RolesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('roles');

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if user has admin access
  useEffect(() => {
    if (session?.user && (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.companyName?.toLowerCase().includes(query) ||
            user.department?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      setMessage({ type: 'success', text: t('updateSuccess') });
      await fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: t('updateError') });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4 text-red-600" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-amber-600" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return t('superAdmin');
      case 'ADMIN':
        return t('admin');
      default:
        return t('user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="h-6 w-6 text-hanko-red" />
          {t('title')}
        </h1>
        <p className="text-gray-500 mt-2">{t('subtitle')}</p>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('search')}
          className="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-sm text-gray-500">{t('totalUsers')}</div>
          <div className="text-2xl font-semibold text-hanko-red mt-2">{users.length}</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Crown className="h-5 w-5 text-red-600" />
            <span className="text-sm">{t('superAdmin')}</span>
          </div>
          <div className="text-2xl font-semibold text-red-700 mt-2">
            {users.filter((u) => u.role === 'SUPER_ADMIN').length}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Shield className="h-5 w-5 text-amber-600" />
            <span className="text-sm">{t('admin')}</span>
          </div>
          <div className="text-2xl font-semibold text-amber-700 mt-2">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-sm">{t('user')}</span>
          </div>
          <div className="text-2xl font-semibold text-blue-700 mt-2">
            {users.filter((u) => u.role === 'USER').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="border-b border-gray-200">
                <th className="text-left font-medium px-4 py-3">{t('userInfo')}</th>
                <th className="text-left font-medium px-4 py-3">{t('companyInfo')}</th>
                <th className="text-left font-medium px-4 py-3">{t('role')}</th>
                <th className="text-left font-medium px-4 py-3">{t('registeredDate')}</th>
                <th className="text-left font-medium px-4 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="border border-gray-200 bg-gray-50 rounded-md w-12 h-12 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">
                      {user.companyName && <div className="font-semibold text-gray-900">{user.companyName}</div>}
                      {user.department && <div className="text-xs text-gray-500">{user.department}</div>}
                      {user.position && <div className="text-xs text-gray-500">{user.position}</div>}
                      {!user.companyName && <span className="text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span
                        className={`inline-flex items-center border rounded-md px-2 py-0.5 text-xs font-medium ${
                          ROLE_BADGE_STYLES[user.role]
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</td>
                  <td className="px-4 py-3">
                    <select
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === session?.user?.id}
                    >
                      <option value="USER">{t('user')}</option>
                      <option value="ADMIN">{t('admin')}</option>
                      {(session?.user as any)?.role === 'SUPER_ADMIN' && (
                        <option value="SUPER_ADMIN">{t('superAdmin')}</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('noResults')}
          </div>
        )}
      </div>

      {/* Role Permissions Info */}
      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('permissions')}</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{t('user')}</h3>
            </div>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• {t('canCreateHankos')}</li>
              <li>• {t('canUploadDocs')}</li>
              <li>• {t('canSignDocs')}</li>
              <li>• {t('canApproveWorkflow')}</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-gray-900">{t('admin')}</h3>
            </div>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• {t('allUserFeatures')}</li>
              <li>• {t('canManageRoles')}</li>
              <li>• {t('canManageOrg')}</li>
              <li>• {t('canViewReports')}</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-red-600" />
              <h3 className="font-semibold text-gray-900">{t('superAdmin')}</h3>
            </div>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• {t('allAdminFeatures')}</li>
              <li>• {t('canAssignSuperAdmin')}</li>
              <li>• {t('canManageSystem')}</li>
              <li>• {t('canViewAuditLogs')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
