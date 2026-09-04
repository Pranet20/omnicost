/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Global State Store with Web Audio Chime Mute State (Phase 20)
 */

import { create } from 'zustand';
import type { 
  OmniResource, 
  Alert, 
  AuditLog, 
  RBACRole, 
  TelemetryTickPayload, 
  RemediationAction,
  RuleConfiguration
} from '../types';
import { type CurrencyCode, formatCurrency, fetchLiveExchangeRates, DEFAULT_RATES } from '../utils/format';

export const getFilteredResources = (resources: OmniResource[], activeTenantId: string | 'ALL'): OmniResource[] => {
  if (!activeTenantId || activeTenantId === 'ALL') return resources;

  const tenantLower = activeTenantId.toLowerCase();
  if (tenantLower.includes('aws')) return resources.filter((r) => r.provider === 'AWS');
  if (tenantLower.includes('gcp')) return resources.filter((r) => r.provider === 'GCP');
  if (tenantLower.includes('openai')) return resources.filter((r) => r.provider === 'OPENAI');
  if (tenantLower.includes('anthropic')) return resources.filter((r) => r.provider === 'ANTHROPIC');
  if (tenantLower.includes('azure')) return resources.filter((r) => r.provider === 'AZURE');

  return resources;
};

export type ThemeMode = 'DARK' | 'LIGHT' | 'COLORBLIND';

interface AppState {
  resources: OmniResource[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  rules: RuleConfiguration[];
  currentUserRole: RBACRole;
  currency: CurrencyCode;
  exchangeRates: Record<CurrencyCode, number>;
  isForexLoading: boolean;
  theme: ThemeMode;
  activeTenantId: string | 'ALL';
  isAudioMuted: boolean;

  setInitialResources: (resources: OmniResource[]) => void;
  processTelemetry: (payload: TelemetryTickPayload) => void;
  remediateResource: (
    resourceId: string, 
    action: RemediationAction, 
    executedBy: string, 
    reasonCode: string
  ) => void;
  updateResourceTags: (resourceId: string, tags: Record<string, string>) => void;
  dismissAlert: (alertId: string) => void;
  setUserRole: (role: RBACRole) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: ThemeMode) => void;
  setActiveTenant: (tenantId: string | 'ALL') => void;
  toggleAudioMute: () => void;
  syncLiveExchangeRates: () => Promise<void>;
  addRule: (rule: RuleConfiguration) => void;
  toggleRule: (ruleId: string) => void;
  exportDataCSV: () => void;
  exportDataJSON: () => void;
}

const AUDIT_LOGS_KEY = 'omnicost_audit_logs';
const USER_ROLE_KEY = 'omnicost_user_role';
const CURRENCY_KEY = 'omnicost_currency';
const THEME_KEY = 'omnicost_theme';
const TENANT_KEY = 'omnicost_tenant';
const AUDIO_MUTE_KEY = 'omnicost_audio_mute';

const loadSavedAuditLogs = (): AuditLog[] => {
  try {
    const saved = localStorage.getItem(AUDIT_LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const loadSavedRole = (): RBACRole => {
  try {
    const saved = localStorage.getItem(USER_ROLE_KEY);
    return (saved as RBACRole) || 'ADMIN';
  } catch {
    return 'ADMIN';
  }
};

const loadSavedCurrency = (): CurrencyCode => {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return (saved as CurrencyCode) || 'INR';
  } catch {
    return 'INR';
  }
};

const loadSavedTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = (saved as ThemeMode) || 'DARK';
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme);
    }
    return theme;
  } catch {
    return 'DARK';
  }
};

const loadSavedTenant = (): string | 'ALL' => {
  try {
    const saved = localStorage.getItem(TENANT_KEY);
    return saved || 'ALL';
  } catch {
    return 'ALL';
  }
};

const loadSavedAudioMute = (): boolean => {
  try {
    const saved = localStorage.getItem(AUDIO_MUTE_KEY);
    return saved === 'true';
  } catch {
    return false;
  }
};

const DEFAULT_RULES: RuleConfiguration[] = [
  {
    id: 'rule-1',
    name: 'Runaway LLM Token Surge (> $5 tick)',
    metricTarget: 'COST_SPIKE',
    thresholdValue: 5.00,
    severity: 'CRITICAL',
    enabled: true
  },
  {
    id: 'rule-2',
    name: 'Idle Cloud Server Waste (CPU < 5%)',
    metricTarget: 'IDLE_CPU',
    thresholdValue: 5.0,
    severity: 'WARNING',
    enabled: true
  },
  {
    id: 'rule-3',
    name: 'Low Prompt Cache Efficiency (< 10%)',
    metricTarget: 'LOW_CACHE_HIT',
    thresholdValue: 10.0,
    severity: 'WARNING',
    enabled: true
  }
];

export const useStore = create<AppState>((set, get) => ({
  resources: [],
  alerts: [],
  auditLogs: loadSavedAuditLogs(),
  rules: DEFAULT_RULES,
  currentUserRole: loadSavedRole(),
  currency: loadSavedCurrency(),
  exchangeRates: DEFAULT_RATES,
  isForexLoading: false,
  theme: loadSavedTheme(),
  activeTenantId: loadSavedTenant(),
  isAudioMuted: loadSavedAudioMute(),

  setInitialResources: (resources) => set({ resources }),

  syncLiveExchangeRates: async () => {
    set({ isForexLoading: true });
    const rates = await fetchLiveExchangeRates();
    set({ exchangeRates: rates, isForexLoading: false });
  },

  processTelemetry: (payload) => set((state) => {
    if (!payload || !payload.updates) return state;

    const newAlerts = [...state.alerts];
    const updateMap = new Map(payload.updates.map((u) => [u.resourceId, u]));

    const updatedResources = state.resources.map((resource) => {
      const update = updateMap.get(resource.id);
      if (!update) return resource;

      if (update.costTick >= 5.00) {
        const existingAlert = newAlerts.find(
          (a) => a.resourceId === resource.id && !a.resolved
        );

        if (!existingAlert) {
          const formattedSurge = formatCurrency(update.costTick, state.currency, 2, state.exchangeRates);
          newAlerts.push({
            id: `alert-${Date.now()}-${resource.id}`,
            resourceId: resource.id,
            severity: 'CRITICAL',
            title: `Runaway Financial Spike: ${resource.name}`,
            message: `Cost surged by +${formattedSurge} in 2 seconds! Immediate action required.`,
            timestamp: payload.timestamp,
            resolved: false,
            ruleTriggered: 'Runaway LLM Token Surge'
          });

        }
      }

      const newTotalSpend = Number((resource.totalSpend + update.costTick).toFixed(2));

      if (resource.type === 'CLOUD') {
        return {
          ...resource,
          totalSpend: newTotalSpend,
          metrics: {
            ...resource.metrics,
            cpuUtilization: update.newCpu ?? resource.metrics.cpuUtilization
          }
        };
      } else {
        const addedTokens = update.newTokens ?? 0;
        return {
          ...resource,
          totalSpend: newTotalSpend,
          metrics: {
            ...resource.metrics,
            promptTokens: resource.metrics.promptTokens + addedTokens
          }
        };
      }
    });

    return { resources: updatedResources, alerts: newAlerts };
  }),

  remediateResource: (resourceId, action, executedBy, reasonCode) => set((state) => {
    const target = state.resources.find((r) => r.id === resourceId);
    if (!target) return state;

    const updatedResources = state.resources.map((r) => {
      if (r.id === resourceId) {
        const newStatus = action === 'TERMINATE' ? 'TERMINATED' : 'THROTTLED';
        return { ...r, status: newStatus as any };
      }
      return r;
    });

    const newAuditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      action,
      resourceId,
      resourceName: target.name,
      executedBy,
      timestamp: new Date().toISOString(),
      reasonCode,
      estimatedMonthlySavings: Number((target.hourlyCost * 24 * 30).toFixed(2))
    };

    const updatedAuditLogs = [newAuditLog, ...state.auditLogs];

    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updatedAuditLogs));
    } catch (e) {
      console.warn('Failed to persist audit logs:', e);
    }

    const resolvedAlerts = state.alerts.map((a) =>
      a.resourceId === resourceId ? { ...a, resolved: true } : a
    );

    return {
      resources: updatedResources,
      alerts: resolvedAlerts,
      auditLogs: updatedAuditLogs
    };
  }),

  updateResourceTags: (resourceId, newTags) => set((state) => ({
    resources: state.resources.map((r) =>
      r.id === resourceId ? { ...r, tags: { ...r.tags, ...newTags } } : r
    )
  })),

  dismissAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
  })),

  setUserRole: (role) => {
    try {
      localStorage.setItem(USER_ROLE_KEY, role);
    } catch (e) {
      console.warn('Failed to persist role:', e);
    }
    set({ currentUserRole: role });
  },

  setCurrency: (currency) => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch (e) {
      console.warn('Failed to persist currency:', e);
    }
    set({ currency });
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme);
    }
    set({ theme });
  },

  setActiveTenant: (tenantId) => {
    try {
      localStorage.setItem(TENANT_KEY, tenantId);
    } catch (e) {
      console.warn('Failed to persist tenant:', e);
    }
    set({ activeTenantId: tenantId });
  },

  toggleAudioMute: () => set((state) => {
    const nextState = !state.isAudioMuted;
    try {
      localStorage.setItem(AUDIO_MUTE_KEY, String(nextState));
    } catch (e) {
      console.warn('Failed to persist audio mute:', e);
    }
    return { isAudioMuted: nextState };
  }),

  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),

  toggleRule: (ruleId) => set((state) => ({
    rules: state.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
  })),

  exportDataCSV: () => {
    import('../utils/export').then((mod) => {
      mod.exportResourcesToCSV(get().resources);
    });
  },

  exportDataJSON: () => {
    import('../utils/export').then((mod) => {
      mod.exportResourcesToJSON(get().resources);
    });
  }
}));