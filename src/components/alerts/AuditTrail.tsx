/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Immutable Audit Trail Table with Multi-Currency Support (Phase 9)
 */

import React from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { ShieldCheck, DollarSign, Power, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const auditLogs = useStore((state) => state.auditLogs);
  const currency = useStore((state) => state.currency);

  const totalActions = auditLogs.length;
  const cumulativeSavingsUsd = auditLogs.reduce((sum, log) => sum + log.estimatedMonthlySavings, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Total Audit Log Entries
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5">{totalActions}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Cumulative Saved Capital
            </p>
            <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              +{formatCurrency(cumulativeSavingsUsd, currency)}
              <span className="text-xs text-slate-400 font-normal"> /mo</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Compliance Status
            </p>
            <p className="text-sm font-extrabold text-white mt-1">SOC-2 & FinOps Audited</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Immutable Remediation Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Recorded Events</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="font-semibold text-slate-400">No Remediation Events Logged</p>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Execute a Kill Switch action from the Data Grid or AI Recommendation tab to record compliance logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action Executed</th>
                  <th className="px-6 py-3.5">Target Resource Name</th>
                  <th className="px-6 py-3.5">Reason Code</th>
                  <th className="px-6 py-3.5">Executed By</th>
                  <th className="px-6 py-3.5 text-right">Est. Monthly Savings ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border flex w-max items-center gap-1.5 ${
                          log.action === 'TERMINATE'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {log.action === 'TERMINATE' ? (
                          <Power className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white font-mono">{log.resourceName || log.resourceId}</td>
                    <td className="px-6 py-4 text-purple-300 font-sans text-xs">{log.reasonCode}</td>
                    <td className="px-6 py-4 text-slate-300 font-sans font-semibold">{log.executedBy}</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-bold font-mono">
                      +{formatCurrency(log.estimatedMonthlySavings, currency)}/mo
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};