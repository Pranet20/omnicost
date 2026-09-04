/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Custom ReactFlow Resource Node Component (Phase 10)
 * 
 * ============================================================================
 * LEARNING RESOURCES & REACTFLOW CUSTOM NODES:
 * ============================================================================
 * 1. ReactFlow Custom Nodes Guide:
 *    https://reactflow.dev/docs/api/nodes/custom-nodes/
 *    Allows rendering custom React components inside ReactFlow canvas nodes with
 *    Handles for connecting directed graph edges (`Handle type="target"` / `Handle type="source"`).
 * ============================================================================
 */

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { OmniResource } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Cloud, Bot, Power, AlertTriangle, Cpu, Layers } from 'lucide-react';

export interface ResourceNodeData {
  resource: OmniResource;
  isAnomaly: boolean;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  rates: Record<string, number>;
  onKillClick?: (resource: OmniResource) => void;
}

export const ResourceNode: React.FC<NodeProps<ResourceNodeData>> = ({ data }) => {
  const { resource, isAnomaly, currency, rates, onKillClick } = data;
  if (!resource) return null;

  const isTerminated = resource.status === 'TERMINATED';
  const isIdle = resource.status === 'IDLE';

  return (
    <div
      className={`w-64 bg-slate-900 border-2 rounded-2xl p-4 shadow-2xl transition-all relative font-sans ${
        isAnomaly
          ? 'border-red-500 shadow-red-500/30 animate-pulse'
          : isTerminated
          ? 'border-slate-800 opacity-60 bg-slate-950'
          : isIdle
          ? 'border-amber-500/50'
          : 'border-slate-700 hover:border-indigo-500'
      }`}
    >
      {/* Top Handle Port for Incoming Edges */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-indigo-500 border-2 border-slate-900 rounded-full"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          {resource.type === 'CLOUD' ? (
            <Cloud className="w-4 h-4 text-indigo-400 shrink-0" />
          ) : (
            <Bot className="w-4 h-4 text-purple-400 shrink-0" />
          )}
          <span className="font-mono text-xs font-bold text-white truncate">{resource.name}</span>
        </div>

        <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-bold text-indigo-300 rounded">
          {resource.provider}
        </span>
      </div>

      {/* Body Metrics */}
      <div className="space-y-1.5 text-[11px] text-slate-300 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">Hourly Rate:</span>
          <span className="font-bold text-white">{formatCurrency(resource.hourlyCost, currency, 2, rates)}/hr</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Total Spend:</span>
          <span className="font-extrabold text-emerald-400">
            {formatCurrency(resource.totalSpend, currency, 2, rates)}
          </span>
        </div>

        {/* Live Metric Progress */}
        <div className="pt-1">
          {resource.type === 'CLOUD' ? (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-400" /> CPU
              </span>
              <span className={resource.metrics.cpuUtilization < 5 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                {resource.metrics.cpuUtilization}%
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-purple-400" /> Cache
              </span>
              <span className="text-purple-300 font-bold">{resource.metrics.cacheHitRate}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer & Kill Switch Trigger Button */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
            isTerminated
              ? 'bg-red-950 text-red-400 border border-red-900 line-through'
              : isAnomaly
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {resource.status}
        </span>

        {!isTerminated && onKillClick && (
          <button
            onClick={() => onKillClick(resource)}
            className="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all"
            title="Execute Kill Switch on this node"
          >
            <Power className="w-3 h-3" />
            KILL
          </button>
        )}
      </div>

      {/* Bottom Handle Port for Outgoing Edges */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-500 border-2 border-slate-900 rounded-full"
      />
    </div>
  );
};