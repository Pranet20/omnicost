/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Footer component housing system metadata and global RBAC Role Switcher
 */

import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { useStore } from '../../store/useStore';
import { Shield, Activity, Cpu, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  const { role, setRole } = useRBAC();
  const resourcesCount = useStore((state) => state.resources.length);
  const activeTenantId = useStore((state) => state.activeTenantId);

  return (
    <footer className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-sans z-20">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">OmniCost Engine v2.4</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-500">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>{resourcesCount.toLocaleString()} Live Assets</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-slate-500">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tenant: <strong className="text-slate-300 uppercase font-mono">{activeTenantId}</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global RBAC Role Switcher relocated to Footer */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner text-xs">
          <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-400 font-semibold">RBAC Access Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            title="Switch User Role & Operational Permissions"
          >
            <option value="ADMIN" className="bg-slate-900 text-white">Admin (Kill Switch On)</option>
            <option value="FINOPS_ANALYST" className="bg-slate-900 text-white">FinOps Analyst</option>
            <option value="VIEWER" className="bg-slate-900 text-white">Viewer (Read Only)</option>
          </select>
        </div>

        <span className="text-[10px] text-slate-600 font-mono hidden sm:inline">
          &copy; {new Date().getFullYear()} OmniCost Enterprise
        </span>
      </div>
    </footer>
  );
};
