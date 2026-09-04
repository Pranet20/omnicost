/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * AG Grid Live Telemetry Metrics Cell Renderer (Phase 4)
 */

import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { OmniResource } from '../../types';

export const MetricsRenderer: React.FC<ICellRendererParams> = (props) => {
  const data = props.data as OmniResource;
  if (!data) return null;

  if (data.type === 'CLOUD') {
    const cpu = data.metrics.cpuUtilization;
    const barColor = cpu < 5 ? 'bg-amber-500' : (cpu > 80 ? 'bg-red-500' : 'bg-indigo-500');

    return (
      <div className="flex flex-col justify-center h-full gap-1 w-full max-w-[170px]">
        <div className="flex justify-between text-[11px] text-slate-300 font-medium">
          <span>CPU Utilization</span>
          <span className={cpu < 5 ? 'text-amber-400 font-bold' : 'text-slate-200'}>{cpu}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(cpu, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  if (data.type === 'LLM') {
    const promptTokens = data.metrics.promptTokens;
    const cachedTokens = data.metrics.cachedTokens;
    const cacheHitRate = data.metrics.cacheHitRate;
    const barColor = cacheHitRate < 10 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
      <div className="flex flex-col justify-center h-full gap-1 w-full max-w-[170px]">
        <div className="flex justify-between text-[11px] text-slate-300 font-medium">
          <span>Prompt Tokens</span>
          <span className="text-purple-300 font-bold">{(promptTokens / 1000).toFixed(0)}k</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(cacheHitRate, 100)}%` }}
            title={`Cache hit rate: ${cacheHitRate}% (${(cachedTokens / 1000).toFixed(0)}k cached)`}
          />
        </div>
      </div>
    );
  }

  return null;
};