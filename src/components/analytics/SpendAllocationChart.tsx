/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Spend Velocity Multi-Line & Provider Bar Chart (Phase 5)
 * 
 * ============================================================================
 * LEARNING RESOURCES & CHART.JS COMBINATION CHARTS:
 * ============================================================================
 * 1. Chart.js Line & Bar Chart Docs:
 *    https://www.chartjs.org/docs/latest/charts/line.html
 *    Visualizes financial spend velocity and vendor breakdown over time.
 * ============================================================================
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useStore, getFilteredResources } from '../../store/useStore';
import { TrendingUp, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const SpendAllocationChart: React.FC = () => {
  const rawResources = useStore((state) => state.resources);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const resources = useMemo(() => getFilteredResources(rawResources, activeTenantId), [rawResources, activeTenantId]);

  const { data, options } = useMemo(() => {
    // Calculate total spend by provider
    const providerSpend: Record<string, number> = {};

    resources.forEach((r) => {
      if (!providerSpend[r.provider]) {
        providerSpend[r.provider] = 0;
      }
      providerSpend[r.provider] += r.totalSpend;
    });

    const labels = Object.keys(providerSpend);
    const barValues = Object.values(providerSpend);

    // Compute trendline (projected baseline)
    const average = barValues.length > 0 ? barValues.reduce((a, b) => a + b, 0) / barValues.length : 0;
    const trendlineValues = barValues.map((v) => Number((v * 1.15).toFixed(2))); // 15% projected velocity line

    const chartData = {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Projected Budget Limit ($)',
          data: trendlineValues,
          borderColor: 'rgba(239, 68, 68, 0.9)', // Red Line
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 3,
          fill: false
        },
        {
          type: 'bar' as const,
          label: 'Actual Spend ($USD)',
          data: barValues,
          backgroundColor: 'rgba(99, 102, 241, 0.75)', // Indigo Bar
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };

    const chartOptions = {
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
            label: (ctx: any) => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94A3B8', font: { size: 11, weight: 600 as const } }
        },
        y: {
          grid: { color: '#1E293B' },
          ticks: {
            color: '#94A3B8',
            callback: (val: any) => `$${val}`
          }
        }
      }
    };

    return { data: chartData, options: chartOptions };
  }, [resources]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[380px] shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Vendor Spend Velocity & Budget Thresholds</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial spend vs. projected monthly budget limits per vendor.
          </p>
        </div>

        <div className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold">
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time Financial Telemetry</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-1 w-full h-full">
        <Chart type="bar" data={data} options={options} />
      </div>
    </div>
  );
};