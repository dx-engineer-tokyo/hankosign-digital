import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface Permission {
  canCreateHankos: boolean;
  canUploadDocs: boolean;
  canSignDocs: boolean;
  canApproveWorkflow: boolean;
  canManageRoles: boolean;
  canManageOrg: boolean;
  canViewReports: boolean;
  canAssignSuperAdmin: boolean;
  canManageSystem: boolean;
  canViewAuditLogs: boolean;
}

export const getRolePermissions = (role: UserRole): Permission => {
  const basePermissions: Permission = {
    canCreateHankos: false,
    canUploadDocs: false,
    canSignDocs: false,
    canApproveWorkflow: false,
    canManageRoles: false,
    canManageOrg: false,
    canViewReports: false,
    canAssignSuperAdmin: false,
    canManageSystem: false,
    canViewAuditLogs: false,
  };

  switch (role) {
    case 'USER':
      return {
        ...basePermissions,
        canCreateHankos: true,
        canUploadDocs: true,
        canSignDocs: true,
        canApproveWorkflow: true,
      };
    case 'ADMIN':
      return {
        ...basePermissions,
        canCreateHankos: true,
        canUploadDocs: true,
        canSignDocs: true,
        canApproveWorkflow: true,
        canManageRoles: true,
        canManageOrg: true,
        canViewReports: true,
      };
    case 'SUPER_ADMIN':
      return {
        canCreateHankos: true,
        canUploadDocs: true,
        canSignDocs: true,
        canApproveWorkflow: true,
        canManageRoles: true,
        canManageOrg: true,
        canViewReports: true,
        canAssignSuperAdmin: true,
        canManageSystem: true,
        canViewAuditLogs: true,
      };
    default:
      return basePermissions;
  }
};

export const hasAdminAccess = (role: UserRole): boolean => {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};

export const hasSuperAdminAccess = (role: UserRole): boolean => {
  return role === 'SUPER_ADMIN';
};

/**
 * Server-side helper to require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

/**
 * Server-side helper to require admin access
 * Redirects to dashboard if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const userRole = (session.user as any).role as UserRole;

  if (!hasAdminAccess(userRole)) {
    redirect('/dashboard');
  }

  return session;
}

/**
 * Server-side helper to require super admin access
 * Redirects to dashboard if not super admin
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  const userRole = (session.user as any).role as UserRole;

  if (!hasSuperAdminAccess(userRole)) {
    redirect('/dashboard');
  }

  return session;
}
