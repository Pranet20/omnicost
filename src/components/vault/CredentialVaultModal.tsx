/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Multi-Tenant Cloud & LLM Credential Vault Simulator (Phase 18)
 * 
 * ============================================================================
 * LEARNING RESOURCES & MULTI-TENANCY BILLING:
 * ============================================================================
 * 1. AWS Consolidated Billing & Organizations:
 *    https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html
 *    Explains how enterprises consolidate billing across multiple AWS accounts,
 *    GCP projects, and OpenAI organization API keys.
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Key, Building, ShieldCheck, Eye, EyeOff, Plus, X, Check, Lock } from 'lucide-react';

export interface TenantAccount {
  id: string;
  name: string;
  provider: 'AWS' | 'GCP' | 'AZURE' | 'OPENAI' | 'ANTHROPIC';
  accountNumberOrOrgId: string;
  maskedApiKey: string;
  rawApiKey: string;
  environment: 'PRODUCTION' | 'STAGING' | 'RESEARCH';
}

export const DEFAULT_TENANTS: TenantAccount[] = [
  {
    id: 'tenant-aws-prod',
    name: 'AWS Production Enterprise Account',
    provider: 'AWS',
    accountNumberOrOrgId: '8492-3841-9012',
    maskedApiKey: 'AKIA****PROD8492',
    rawApiKey: 'AKIAIOSFODNN7EXAMPLEPROD',
    environment: 'PRODUCTION'
  },
  {
    id: 'tenant-gcp-west',
    name: 'GCP Analytics & Data Lake',
    provider: 'GCP',
    accountNumberOrOrgId: 'project-omnicost-west1',
    maskedApiKey: 'gcp-sa-****-west',
    rawApiKey: 'gcp-sa-8921-prod-key-json',
    environment: 'PRODUCTION'
  },
  {
    id: 'tenant-openai-org',
    name: 'OpenAI Enterprise LLM Organization',
    provider: 'OPENAI',
    accountNumberOrOrgId: 'org-omnicost-ai-corp',
    maskedApiKey: 'sk-proj-****-enterprise',
    rawApiKey: 'sk-proj-9821a-enterprise-secret-key',
    environment: 'PRODUCTION'
  },
  {
    id: 'tenant-anthropic-org',
    name: 'Anthropic Claude Research Org',
    provider: 'ANTHROPIC',
    accountNumberOrOrgId: 'org-anth-research-99',
    maskedApiKey: 'sk-ant-****-claude35',
    rawApiKey: 'sk-ant-api03-research-sonnet-key',
    environment: 'RESEARCH'
  }
];

interface CredentialVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CredentialVaultModal: React.FC<CredentialVaultModalProps> = ({ isOpen, onClose }) => {
  const activeTenantId = useStore((state) => state.activeTenantId);
  const setActiveTenant = useStore((state) => state.setActiveTenant);

  const [showRawKeys, setShowRawKeys] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleShowKey = (id: string) => {
    setShowRawKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl z-10 space-y-6 overflow-hidden font-sans"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-wide">
                  Multi-Tenant Cloud & LLM Credential Vault
                </h2>
                <p className="text-xs text-slate-400">Simulate organization accounts & client-side masked API keys.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Tenant Selection Banner */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300">Active Billing Context:</span>
            </div>
            <select
              value={activeTenantId}
              onChange={(e) => setActiveTenant(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Accounts (Consolidated View)</option>
              {DEFAULT_TENANTS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Tenants List */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {DEFAULT_TENANTS.map((tenant) => {
              const isSelected = activeTenantId === tenant.id;
              const isVisible = Boolean(showRawKeys[tenant.id]);

              return (
                <div
                  key={tenant.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-indigo-300 rounded font-mono">
                        {tenant.provider}
                      </span>
                      <h4 className="font-bold text-white text-xs">{tenant.name}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold">
                        {tenant.environment}
                      </span>

                      <button
                        onClick={() => setActiveTenant(tenant.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {isSelected ? 'ACTIVE' : 'SELECT'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                    <span className="text-slate-400">Account / Org ID: <strong className="text-slate-200">{tenant.accountNumberOrOrgId}</strong></span>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        API Key: <strong className="text-purple-300">{isVisible ? tenant.rawApiKey : tenant.maskedApiKey}</strong>
                      </span>
                      <button
                        onClick={() => toggleShowKey(tenant.id)}
                        className="text-slate-500 hover:text-slate-300"
                        title={isVisible ? 'Hide raw key' : 'Show raw key'}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Client-Side Encryption Vault Enabled
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
