/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * AG Grid Resource Status Custom Cell Renderer (Phase 4)
 */

import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { ResourceStatus } from '../../types';

export const StatusRenderer: React.FC<ICellRendererParams> = (props) => {
  const status = props.value as ResourceStatus;

  let bgClass = 'bg-slate-800 text-slate-400 border-slate-700';
  let dotClass = 'bg-slate-400';

  if (status === 'ACTIVE') {
    bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotClass = 'bg-emerald-400 animate-pulse';
  } else if (status === 'IDLE') {
    bgClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotClass = 'bg-amber-400';
  } else if (status === 'CRITICAL') {
    bgClass = 'bg-red-500/10 text-red-400 border-red-500/30';
    dotClass = 'bg-red-400 animate-ping';
  } else if (status === 'THROTTLED') {
    bgClass = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    dotClass = 'bg-orange-400';
  } else if (status === 'TERMINATED') {
    bgClass = 'bg-red-950/40 text-red-300 border-red-900/50 line-through';
    dotClass = 'bg-red-500';
  }

  return (
    <div className="flex items-center h-full">
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${bgClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {status}
      </span>
    </div>
  );
};