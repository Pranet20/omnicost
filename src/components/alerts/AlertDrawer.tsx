/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Real-Time Anomaly Alert Slide-Out Drawer (Phase 6)
 * 
 * ============================================================================
 * LEARNING RESOURCES & FRAMER MOTION:
 * ============================================================================
 * 1. Framer Motion Animations:
 *    https://www.framer.com/motion/animate-presence/
 *    Provides slide-out animations (`motion.div`, `AnimatePresence`) for UI drawers.
 * ============================================================================
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Zap, PowerOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useRBAC } from '../../hooks/useRBAC';
import type { OmniResource } from '../../types';

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResourceForKill?: (resource: OmniResource) => void;
}

export const AlertDrawer: React.FC<AlertDrawerProps> = ({
  isOpen,
  onClose,
  onSelectResourceForKill
}) => {
  const allAlerts = useStore((state) => state.alerts);
  const activeAlerts = allAlerts.filter((a) => !a.resolved);
  const dismissAlert = useStore((state) => state.dismissAlert);
  const resources = useStore((state) => state.resources);
  const { canKillResource } = useRBAC();

  const handleTriggerKill = (resourceId: string) => {
    const target = resources.find((r) => r.id === resourceId);
    if (target && onSelectResourceForKill) {
      onSelectResourceForKill(target);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-[460px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3 text-red-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-wide">Live Anomaly Center</h2>
                  <p className="text-[11px] text-slate-400">Real-time alerts triggered by Web Worker stream.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Cards Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/40" />
                  <p className="font-semibold text-slate-300">All Systems Operational</p>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    No active financial leaks or runaway LLM loops detected.
                  </p>
                </div>
              ) : (
                activeAlerts.map((alert) => {
                  const targetResource = resources.find((r) => r.id === alert.resourceId);

                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      className="bg-slate-950 border border-red-500/30 rounded-xl p-5 relative overflow-hidden space-y-3 shadow-lg"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />

                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                          {alert.severity} ANOMALY
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white mb-1">{alert.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => handleTriggerKill(alert.resourceId)}
                          disabled={!canKillResource || !targetResource}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-md ${
                            !canKillResource || !targetResource
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40'
                          }`}
                        >
                          <PowerOff className="w-3.5 h-3.5" />
                          <span>Kill Resource</span>
                        </button>

                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};