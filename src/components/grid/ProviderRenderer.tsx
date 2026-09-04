/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * AG Grid Provider Custom Cell Renderer (Phase 4)
 * 
 * ============================================================================
 * LEARNING RESOURCES & AG GRID CUSTOM CELL RENDERERS:
 * ============================================================================
 * 1. AG Grid React Cell Renderers:
 *    https://www.ag-grid.com/react-data-grid/component-cell-renderer/
 *    Allows rendering custom React components inside AG Grid table cells.
 * ============================================================================
 */

import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { Provider } from '../../types';
import { Cloud, Bot, Server, Cpu } from 'lucide-react';

export const ProviderRenderer: React.FC<ICellRendererParams> = (props) => {
  const provider = props.value as Provider;
  if (!provider) return null;

  const providerStyles: Record<Provider, { bg: string; text: string; border: string }> = {
    AWS: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    GCP: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    AZURE: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    OPENAI: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    ANTHROPIC: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    COHERE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    MISTRAL: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' }
  };

  const style = providerStyles[provider] || { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };

  const getIcon = () => {
    if (['AWS', 'GCP', 'AZURE'].includes(provider)) {
      return <Cloud className="w-3.5 h-3.5" />;
    }
    return <Bot className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex items-center h-full">
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${style.bg} ${style.text} ${style.border}`}>
        {getIcon()}
        {provider}
      </span>
    </div>
  );
};
