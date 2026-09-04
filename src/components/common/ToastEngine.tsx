/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Floating Toast Notification Engine (Phase 20)
 * 
 * ============================================================================
 * LEARNING RESOURCES & FRAMER MOTION ANIMS:
 * ============================================================================
 * 1. Framer Motion AnimatePresence Toast Container:
 *    https://www.framer.com/motion/animate-presence/
 *    Renders non-intrusive floating alert toasts at bottom-right of viewport.
 * ============================================================================
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { AlertTriangle, Volume2, VolumeX, X, ArrowRight } from 'lucide-react';

interface ToastEngineProps {
  onOpenAlerts: () => void;
}

export const ToastEngine: React.FC<ToastEngineProps> = ({ onOpenAlerts }) => {
  const rawAlerts = useStore((state) => state.alerts);
  const dismissAlert = useStore((state) => state.dismissAlert);
  const isAudioMuted = useStore((state) => state.isAudioMuted);
  const toggleAudioMute = useStore((state) => state.toggleAudioMute);

  const alerts = useMemo(() => rawAlerts.filter((a) => !a.resolved), [rawAlerts]);

  // Guarantee maximum 1 active popup on screen at any time
  const latestAlerts = useMemo(() => alerts.slice(-1), [alerts]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none font-sans">
      <AnimatePresence>
        {latestAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto bg-slate-900/95 border border-red-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 relative overflow-hidden"
          >
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-xs">{alert.title}</h4>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-slate-500 hover:text-white p-0.5"
                  aria-label="Dismiss Toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">{alert.message}</p>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={toggleAudioMute}
                  className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
                  title={isAudioMuted ? 'Unmute alert chimes' : 'Mute alert chimes'}
                >
                  {isAudioMuted ? <VolumeX className="w-3 h-3 text-amber-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                  {isAudioMuted ? 'Muted' : 'Audio On'}
                </button>

                <button
                  onClick={onOpenAlerts}
                  className="text-[11px] font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
