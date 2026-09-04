/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Anomaly Rule Configurator UI (Phase 6)
 * 
 * ============================================================================
 * LEARNING RESOURCES & REACT CONTROLLED COMPONENTS:
 * ============================================================================
 * 1. Controlled Components in React:
 *    https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components
 *    Manages input state for thresholds, rule names, and alert severities explicitly via React state.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useRBAC } from '../../hooks/useRBAC';
import type { RuleConfiguration, AlertSeverity } from '../../types';
import { Sliders, Plus, Check, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';

export const RuleConfigurator: React.FC = () => {
  const rules = useStore((state) => state.rules);
  const addRule = useStore((state) => state.addRule);
  const toggleRule = useStore((state) => state.toggleRule);
  const { canEditRules } = useRBAC();

  const [isAdding, setIsAdding] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [metricTarget, setMetricTarget] = useState<RuleConfiguration['metricTarget']>('COST_SPIKE');
  const [thresholdValue, setThresholdValue] = useState<number>(5.0);
  const [severity, setSeverity] = useState<AlertSeverity>('CRITICAL');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const newRule: RuleConfiguration = {
      id: `rule-${Date.now()}`,
      name: ruleName.trim(),
      metricTarget,
      thresholdValue: Number(thresholdValue),
      severity,
      enabled: true
    };

    addRule(newRule);
    setRuleName('');
    setIsAdding(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-bold text-white text-sm">FinOps Anomaly Rule Engine</h3>
            <p className="text-xs text-slate-400">Configure real-time thresholds for runaway spend and idle waste.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          disabled={!canEditRules}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
            !canEditRules
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Rule
        </button>
      </div>

      {/* New Rule Creation Form */}
      {isAdding && (
        <form onSubmit={handleCreateRule} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Detection Rule</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Rule Name</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Unusually High API Latency (> 2000ms)"
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Metric Target</label>
              <select
                value={metricTarget}
                onChange={(e) => setMetricTarget(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="COST_SPIKE">Financial Cost Surge ($/tick)</option>
                <option value="IDLE_CPU">Idle Infrastructure (CPU %)</option>
                <option value="TOKEN_BURST">LLM Token Burst (Tokens/hr)</option>
                <option value="LOW_CACHE_HIT">Low Prompt Cache Hit Rate (%)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Threshold Limit</label>
              <input
                type="number"
                step="0.1"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Alert Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL (Red Pulse Alert)</option>
                <option value="WARNING">WARNING (Yellow Badge)</option>
                <option value="INFO">INFO (Informational)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3.5 bg-slate-800/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  rule.severity === 'CRITICAL'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {rule.severity}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-100">{rule.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Target: <span className="font-mono text-purple-300">{rule.metricTarget}</span> | Threshold: <span className="font-bold text-white">{rule.thresholdValue}</span>
                </p>
              </div>
            </div>

            <button
              disabled={!canEditRules}
              onClick={() => toggleRule(rule.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {rule.enabled ? (
                <ToggleRight className="w-6 h-6 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
