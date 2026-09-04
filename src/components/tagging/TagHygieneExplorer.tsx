/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * FinOps Tagging Hygiene & Chargeback Matrix Explorer (Phase 16)
 * 
 * ============================================================================
 * LEARNING RESOURCES & COST ALLOCATION TAGGING:
 * ============================================================================
 * 1. AWS Cost Allocation Tagging Best Practices:
 *    https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html
 *    Explains why mandatory metadata tags ('CostCenter', 'Owner', 'Env') are essential
 *    for financial chargeback allocation and eliminating unassigned waste.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import type { OmniResource } from '../../types';
import { formatCurrency } from '../../utils/format';
import { 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Edit3, 
  Save, 
  X, 
  HelpCircle,
  PieChart
} from 'lucide-react';

export const TagHygieneExplorer: React.FC = () => {
  const resources = useStore((state) => state.resources);
  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);
  const updateResourceTags = useStore((state) => state.updateResourceTags);

  const [editingResource, setEditingResource] = useState<OmniResource | null>(null);
  const [editOwner, setEditOwner] = useState('');
  const [editEnv, setEditEnv] = useState('prod');

  // Mathematical Tagging Completeness & Chargeback Analysis
  const analysis = useMemo(() => {
    let fullyTaggedCount = 0;
    let unallocatedSpendUsd = 0;

    const chargebackMap: Record<string, number> = {};

    resources.forEach((r) => {
      const hasCostCenter = Boolean(r.costCenter);
      const hasOwner = Boolean(r.tags?.Owner);
      const hasEnv = Boolean(r.tags?.Env);

      if (hasCostCenter && hasOwner && hasEnv) {
        fullyTaggedCount++;
      } else {
        unallocatedSpendUsd += r.totalSpend;
      }

      const cc = r.costCenter || 'UNASSIGNED';
      chargebackMap[cc] = (chargebackMap[cc] || 0) + r.totalSpend;
    });

    const totalCount = resources.length || 1;
    const completenessScorePct = ((fullyTaggedCount / totalCount) * 100).toFixed(1);

    const untaggedResources = resources.filter(
      (r) => !r.costCenter || !r.tags?.Owner || !r.tags?.Env
    );

    return {
      completenessScorePct,
      fullyTaggedCount,
      unallocatedSpendUsd,
      untaggedResources,
      chargebackMap
    };
  }, [resources]);

  const handleOpenEditModal = (res: OmniResource) => {
    setEditingResource(res);
    setEditOwner(res.tags?.Owner || 'devops-team@company.com');
    setEditEnv(res.tags?.Env || 'prod');
  };

  const handleSaveTags = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    updateResourceTags(editingResource.id, {
      Owner: editOwner,
      Env: editEnv
    });

    setEditingResource(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              FinOps Tagging Hygiene & Chargeback Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Audit metadata tagging compliance across 5,000+ infrastructure resources. Untagged assets create
            unassigned financial waste and prevent departmental cost center chargeback.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-blue-500/40 px-6 py-4 rounded-xl text-right shrink-0 shadow-lg relative z-10">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Unallocated Tagging Waste
          </p>
          <p className="text-3xl font-extrabold text-amber-400 tracking-tight mt-0.5 font-mono">
            {formatCurrency(analysis.unallocatedSpendUsd, currency, 0, exchangeRates)}
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Tagging Completeness Score
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5 font-mono">
              {analysis.completenessScorePct}%
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              100% Compliant Assets
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-0.5 font-mono">
              {analysis.fullyTaggedCount} / {resources.length}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Untagged / Mis-tagged Assets
            </p>
            <p className="text-2xl font-extrabold text-amber-400 mt-0.5 font-mono">
              {analysis.untaggedResources.length} Assets
            </p>
          </div>
        </div>
      </div>

      {/* Untagged Resources Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Actionable Untagged Asset List</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {analysis.untaggedResources.length} Items Require Tagging Fix
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Asset Name</th>
                <th className="px-6 py-3.5">Provider</th>
                <th className="px-6 py-3.5">Cost Center</th>
                <th className="px-6 py-3.5">Owner Tag</th>
                <th className="px-6 py-3.5">Environment Tag</th>
                <th className="px-6 py-3.5 text-right">Total Spend ({currency})</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {analysis.untaggedResources.slice(0, 15).map((res) => {
                const hasOwner = Boolean(res.tags?.Owner);
                const hasEnv = Boolean(res.tags?.Env);

                return (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{res.name}</td>
                    <td className="px-6 py-4 text-indigo-300">{res.provider}</td>
                    <td className="px-6 py-4 text-purple-300">{res.costCenter}</td>
                    <td className="px-6 py-4">
                      {hasOwner ? (
                        <span className="text-emerald-400 font-sans text-xs">{res.tags.Owner}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded text-[10px] font-extrabold">
                          MISSING OWNER
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasEnv ? (
                        <span className="text-cyan-400 font-sans text-xs">{res.tags.Env}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] font-extrabold">
                          MISSING ENV
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                      {formatCurrency(res.totalSpend, currency, 2, exchangeRates)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenEditModal(res)}
                        className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 mx-auto"
                      >
                        <Edit3 className="w-3 h-3" />
                        Fix Tags
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tag Editing Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Update Resource Metadata Tags</h3>
              <button onClick={() => setEditingResource(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Target Asset: <strong className="text-white font-mono">{editingResource.name}</strong>
            </p>

            <form onSubmit={handleSaveTags} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Owner Contact Tag</label>
                <input
                  type="text"
                  value={editOwner}
                  onChange={(e) => setEditOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2"
                  placeholder="e.g. devops-team@company.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Environment Tag</label>
                <select
                  value={editEnv}
                  onChange={(e) => setEditEnv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2"
                >
                  <option value="prod">Production (prod)</option>
                  <option value="staging">Staging (staging)</option>
                  <option value="dev">Development (dev)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Metadata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
