/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * LLM Token Distribution & Caching Efficiency Chart (Phase 5)
 * 
 * ============================================================================
 * LEARNING RESOURCES & CHART.JS / REACT-CHARTJS-2:
 * ============================================================================
 * 1. React Chart.js 2 Integration:
 *    https://react-chartjs-2.js.org/
 *    Canvas-based charting library for React. Tree-shaking is enabled by manually registering
 *    Chart.js modules (`BarElement`, `CategoryScale`, `LinearScale`, `Legend`, `Tooltip`).
 * 
 * 2. React useMemo Aggregation:
 *    https://react.dev/reference/react/useMemo
 *    Aggregates thousands of raw LLM token telemetry records into grouped model metrics without lag.
 * ============================================================================
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useStore, getFilteredResources } from '../../store/useStore';
import type { LLMResource } from '../../types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const TokenDistributionChart: React.FC = () => {
  const rawResources = useStore((state) => state.resources);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const resources = useMemo(() => getFilteredResources(rawResources, activeTenantId), [rawResources, activeTenantId]);

  // Group LLM resources by model name using useMemo
  const chartData = useMemo(() => {
    const llmResources = resources.filter((r): r is LLMResource => r.type === 'LLM');

    const modelMap: Record<string, { prompt: number; completion: number; cached: number }> = {};

    llmResources.forEach((res) => {
      const model = res.modelName || 'Other';
      if (!modelMap[model]) {
        modelMap[model] = { prompt: 0, completion: 0, cached: 0 };
      }
      modelMap[model].prompt += res.metrics.promptTokens;
      modelMap[model].completion += res.metrics.completionTokens;
      modelMap[model].cached += res.metrics.cachedTokens || 0;
    });

    const labels = Object.keys(modelMap);
    const promptData = labels.map((m) => modelMap[m].prompt);
    const completionData = labels.map((m) => modelMap[m].completion);
    const cachedData = labels.map((m) => modelMap[m].cached);

    const totalPrompt = promptData.reduce((a, b) => a + b, 0);
    const totalCached = cachedData.reduce((a, b) => a + b, 0);
    const globalCacheEfficiency = totalPrompt > 0 ? ((totalCached / totalPrompt) * 100).toFixed(1) : '0';

    return {
      labels,
      datasets: [
        {
          label: 'Prompt Tokens (Input)',
          data: promptData,
          backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
          borderRadius: 4
        },
        {
          label: 'Completion Tokens (Output)',
          data: completionData,
          backgroundColor: 'rgba(168, 85, 247, 0.8)', // Purple
          borderRadius: 4
        },
        {
          label: 'Cached Tokens (Saved)',
          data: cachedData,
          backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald
          borderRadius: 4
        }
      ],
      globalCacheEfficiency,
      totalTokens: (totalPrompt + totalCached) / 1_000_000
    };
  }, [resources]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94A3B8',
          font: { size: 11, weight: 600 as const }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        padding: 12,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${(ctx.raw / 1000).toFixed(1)}k Tokens`
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { size: 11 } }
      },
      y: {
        stacked: true,
        grid: { color: '#1E293B' },
        ticks: {
          color: '#94A3B8',
          callback: (value: any) => `${(value / 1000000).toFixed(1)}M`
        }
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[380px] shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">LLM Token Distribution & Prompt Caching</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated prompt, completion, and prompt cache hit volumes per model.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{chartData.globalCacheEfficiency}% Cache Efficiency</span>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="relative flex-1 w-full h-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};