/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Role-Based Access Control (RBAC) Custom Hook (Phase 3)
 * 
 * ============================================================================
 * LEARNING RESOURCES & REACT CUSTOM HOOKS:
 * ============================================================================
 * 1. Reusing Logic with Custom Hooks:
 *    https://react.dev/learn/reusing-logic-with-custom-hooks
 *    Custom hooks are JavaScript functions whose names start with `use` and can call other hooks.
 *    They encapsulate reusable state logic (e.g. permission checks).
 * ============================================================================
 */

import { useStore } from '../store/useStore';
import type { RBACRole } from '../types';

export interface RBACPermissions {
  role: RBACRole;
  canKillResource: boolean;
  canEditRules: boolean;
  canExportData: boolean;
  isReadOnly: boolean;
  setRole: (role: RBACRole) => void;
}

export function useRBAC(): RBACPermissions {
  const role = useStore((state) => state.currentUserRole);
  const setRole = useStore((state) => state.setUserRole);

  const permissions: RBACPermissions = {
    role,
    canKillResource: role === 'ADMIN',
    canEditRules: role === 'ADMIN' || role === 'FINOPS_ANALYST',
    canExportData: true, // All roles can export reports
    isReadOnly: role === 'VIEWER',
    setRole
  };

  return permissions;
}
