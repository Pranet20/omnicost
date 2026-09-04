/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Collapsible Sidebar Navigation (Phases 1 - 19)
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  LayoutDashboard, 
  TableProperties, 
  LineChart, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Boxes,
  RotateCcw,
  Calculator,
  Tag,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const rawAlerts = useStore((state) => state.alerts);
  const alertsCount = useMemo(() => rawAlerts.filter((a) => !a.resolved).length, [rawAlerts]);
  const auditLogsCount = useStore((state) => state.auditLogs.length);

  const navigationItems = [
    { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
    { id: 'grid', label: 'AG Grid Analytics', icon: TableProperties },
    { id: 'token-charts', label: 'Token Intelligence', icon: LineChart },
    { id: 'simulator', label: 'AI Loop Simulator', icon: RotateCcw, badge: 'NEW' },
    { id: 'estimator', label: 'Prompt Estimator', icon: FileText, badge: '98%' },
    { id: 'calculator', label: 'Forecast Calculator', icon: Calculator },
    { id: 'tagging', label: 'Tagging Hygiene', icon: Tag, badge: '99%' },
    { id: 'recommendations', label: 'AI FinOps Engine', icon: Sparkles, badge: 'AI' },
    { id: 'anomalies', label: 'Anomaly Center', icon: AlertTriangle, count: alertsCount, countColor: 'bg-red-500' },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck, count: auditLogsCount, countColor: 'bg-indigo-600' }
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 h-screen flex flex-col transition-all duration-300 relative z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-white tracking-wide text-sm">OmniCost</h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">FinOps & LLMOps</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && (
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-extrabold rounded-md shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full ${item.countColor}`}>
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          <p className="font-semibold text-slate-400">OmniCost v2.4 Enterprise</p>
          <p className="text-[10px] mt-0.5">Off-Thread Web Worker Engine</p>
        </div>
      )}
    </aside>
  );
};