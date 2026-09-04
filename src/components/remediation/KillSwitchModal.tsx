/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Actionable Kill Switch Remediation Modal with Multi-Currency Support (Phase 9)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OmniResource, RemediationAction } from '../../types';
import { useStore } from '../../store/useStore';
import { useRBAC } from '../../hooks/useRBAC';
import { formatCurrency } from '../../utils/format';
import { Power, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface KillSwitchModalProps {
  resource: OmniResource | null;
  onClose: () => void;
}

export const KillSwitchModal: React.FC<KillSwitchModalProps> = ({ resource, onClose }) => {
  const remediateResource = useStore((state) => state.remediateResource);
  const currency = useStore((state) => state.currency);
  const { role, canKillResource } = useRBAC();

  const [action, setAction] = useState<RemediationAction>('TERMINATE');
  const [reasonCode, setReasonCode] = useState<string>('RUNAWAY_LLM_LOOP');
  const [confirmed, setConfirmed] = useState<boolean>(false);

  if (!resource) return null;

  const estimatedMonthlySavingsUsd = Number((resource.hourlyCost * 24 * 30).toFixed(2));

  const handleExecuteRemediation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed || !canKillResource) return;

    remediateResource(resource.id, action, role, reasonCode);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 space-y-6 overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
                <Power className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-wide">
                  Execute Kill Switch Remediation
                </h2>
                <p className="text-xs text-slate-400">Actionable FinOps Administrative Override</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Target Asset:</span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {resource.name}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Vendor / Provider:</span>
              <span className="font-semibold text-indigo-400">{resource.provider}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Hourly Rate ({currency}):</span>
              <span className="font-mono text-slate-200">{formatCurrency(resource.hourlyCost, currency)}/hr</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">Projected Monthly Savings:</span>
              <span className="font-mono font-extrabold text-emerald-400 text-base">
                +{formatCurrency(estimatedMonthlySavingsUsd, currency)}/mo
              </span>
            </div>
          </div>

          <form onSubmit={handleExecuteRemediation} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Remediation Action</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAction('TERMINATE')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    action === 'TERMINATE'
                      ? 'bg-red-600/20 text-red-300 border-red-500/50 shadow-lg'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  TERMINATE (Shut Down)
                </button>

                <button
                  type="button"
                  onClick={() => setAction('THROTTLE')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    action === 'THROTTLE'
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 shadow-lg'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  THROTTLE (Rate Limit)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Mandatory Reason Code</label>
              <select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="RUNAWAY_LLM_LOOP">Recursive LLM Agent Loop (Per-Token Burn)</option>
                <option value="ABANDONED_IDLE_RESOURCE">Abandoned Idle Server (&lt; 5% CPU)</option>
                <option value="BUDGET_LIMIT_EXCEEDED">Department Budget Ceiling Exceeded</option>
                <option value="UNAUTHORIZED_SPIKE">Unauthorized Financial Spike Alert</option>
              </select>
            </div>

            <label className="flex items-start gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-300 leading-snug">
                I confirm that pulling the Kill Switch will update the status to{' '}
                <strong className="text-white">{action}</strong> and record an immutable entry in the audit log.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!confirmed || !canKillResource}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-xl ${
                  !confirmed || !canKillResource
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                EXECUTE KILL SWITCH
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
