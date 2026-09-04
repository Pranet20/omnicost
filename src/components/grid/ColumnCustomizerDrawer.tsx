/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * AG Grid Column Customizer & Saved Views Drawer (Phase 13)
 * 
 * ============================================================================
 * LEARNING RESOURCES & AG GRID COLUMN API:
 * ============================================================================
 * 1. AG Grid Column State & Visibility:
 *    https://www.ag-grid.com/react-data-grid/column-state/
 *    Allows dynamic toggling of column visibility and saving custom layout presets.
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Columns, X, Check, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';

export interface ColumnVisibilityState {
  name: boolean;
  provider: boolean;
  costCenter: boolean;
  status: boolean;
  metrics: boolean;
  hourlyCost: boolean;
  totalSpend: boolean;
  region: boolean;
}

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibilityState = {
  name: true,
  provider: true,
  costCenter: true,
  status: true,
  metrics: true,
  hourlyCost: true,
  totalSpend: true,
  region: false
};

interface ColumnCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columnVisibility: ColumnVisibilityState;
  onToggleColumn: (colKey: keyof ColumnVisibilityState) => void;
  onResetColumns: () => void;
  onApplyPreset: (presetName: string) => void;
}

export const ColumnCustomizerDrawer: React.FC<ColumnCustomizerDrawerProps> = ({
  isOpen,
  onClose,
  columnVisibility,
  onToggleColumn,
  onResetColumns,
  onApplyPreset
}) => {
  const columnLabels: Record<keyof ColumnVisibilityState, string> = {
    name: 'Resource Name',
    provider: 'Provider Vendor',
    costCenter: 'Cost Center Department',
    status: 'Health Status Badge',
    metrics: 'Live Telemetry Metrics Bar',
    hourlyCost: 'Hourly Rate',
    totalSpend: 'Total Cumulative Spend',
    region: 'Cloud Region / Location'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <Columns className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-wide">Customize Table Columns</h2>
                  <p className="text-[11px] text-slate-400">Toggle visible grid fields & apply saved layout presets.</p>
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

            {/* Presets Bar */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Saved View Presets
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onApplyPreset('DEFAULT')}
                  className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold transition-all"
                >
                  Default View
                </button>
                <button
                  onClick={() => onApplyPreset('EXECUTIVE')}
                  className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-bold transition-all"
                >
                  Executive Summary
                </button>
                <button
                  onClick={() => onApplyPreset('FINANCIAL')}
                  className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all"
                >
                  Financial Focus
                </button>
              </div>
            </div>

            {/* Toggle List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(Object.keys(columnLabels) as Array<keyof ColumnVisibilityState>).map((key) => {
                const isVisible = columnVisibility[key];

                return (
                  <div
                    key={key}
                    onClick={() => onToggleColumn(key)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isVisible
                        ? 'bg-slate-800/80 border-slate-700 text-white'
                        : 'bg-slate-950/60 border-slate-850 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isVisible ? (
                        <Eye className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      )}
                      <span className="text-xs font-bold">{columnLabels[key]}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isVisible
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isVisible && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <button
                onClick={onResetColumns}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
