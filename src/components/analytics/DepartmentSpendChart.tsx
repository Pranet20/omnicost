/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Department Cost Breakdown Doughnut Chart (Phase 5)
 * 
 * ============================================================================
 * LEARNING RESOURCES & CHART.JS DOUGHNUT:
 * ============================================================================
 * 1. Chart.js Doughnut Chart:
 *    https://www.chartjs.org/docs/latest/charts/doughnut.html
 *    Renders interactive proportional financial cost breakdowns by Cost Center.
 * ============================================================================
 */

import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useStore, getFilteredResources } from '../../store/useStore';
import type { CostCenter } from '../../types';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export const DepartmentSpendChart: React.FC = () => {
  const rawResources = useStore((state) => state.resources);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const resources = useMemo(() => getFilteredResources(rawResources, activeTenantId), [rawResources, activeTenantId]);

  const { data, options, totalSpend } = useMemo(() => {
    const departmentMap: Record<CostCenter, number> = {
      ENGINEERING: 0,
      DATA_SCIENCE: 0,
      PRODUCT: 0,
      MARKETING: 0,
      RESEARCH: 0
    };

    resources.forEach((r) => {
      if (departmentMap[r.costCenter] !== undefined) {
        departmentMap[r.costCenter] += r.totalSpend;
      }
    });

    const total = Object.values(departmentMap).reduce((a, b) => a + b, 0);

    const labels = Object.keys(departmentMap).map(
      (key) => key.replace('_', ' ')
    );
    const values = Object.values(departmentMap);

    const chartData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            'rgba(99, 102, 241, 0.85)',  // Indigo
            'rgba(168, 85, 247, 0.85)', // Purple
            'rgba(14, 165, 233, 0.85)',  // Sky
            'rgba(245, 158, 11, 0.85)',  // Amber
            'rgba(16, 185, 129, 0.85)'   // Emerald
          ],
          borderColor: '#0F172A',
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: '#94A3B8',
            font: { size: 11, weight: 600 as const },
            padding: 12
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
            label: (ctx: any) => {
              const val = ctx.raw || 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
              return ` $${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${pct}%)`;
            }
          }
        }
      },
      cutout: '72%'
    };

    return { data: chartData, options: chartOptions, totalSpend: total };
  }, [resources]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[380px] shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-4 h-4 text-purple-400" />
        <div>
          <h3 className="text-sm font-bold text-white">Department Cost Breakdown</h3>
          <p className="text-xs text-slate-400">Internal financial chargeback allocation by Cost Center.</p>
        </div>
      </div>

      {/* Doughnut Canvas with Center Text Overlay */}
      <div className="relative flex-1 w-full h-full">
        <Doughnut data={data} options={options} />

        {/* Center Total Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-28">
          <span className="text-xl font-extrabold text-white">
            ${(totalSpend / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total Spend
          </span>
        </div>
      </div>
    </div>
  );
};
