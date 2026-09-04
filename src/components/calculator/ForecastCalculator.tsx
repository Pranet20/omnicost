/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Financial Forecast & What-If Scenario Calculator (Phase 12)
 * 
 * ============================================================================
 * LEARNING RESOURCES & FINOPS SCENARIO MODELING:
 * ============================================================================
 * 1. AWS FinOps Cost Optimization Guide:
 *    https://aws.amazon.com/aws-cost-management/
 *    Provides mathematical frameworks for modeling Reserved Instance coverage,
 *    model tier migrations, and 12-month capital savings projections.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { useStore, getFilteredResources } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calculator, TrendingUp, Sliders, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const ForecastCalculator: React.FC = () => {
  const rawResources = useStore((state) => state.resources);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const resources = useMemo(() => getFilteredResources(rawResources, activeTenantId), [rawResources, activeTenantId]);
  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);

  // Current baseline monthly spend (USD)
  const currentMonthlySpendUsd = useMemo(() => {
    return resources.reduce((sum, r) => sum + r.hourlyCost * 24 * 30, 0);
  }, [resources]);

  // Scenario Sliders State
  const [momGrowthRate, setMomGrowthRate] = useState<number>(10); // 10% MoM growth
  const [modelMigrationPct, setModelMigrationPct] = useState<number>(30); // 30% migrated to lighter models
  const [riCoveragePct, setRiCoveragePct] = useState<number>(40); // 40% Reserved Instance coverage
  const [idleCleanupPct, setIdleCleanupPct] = useState<number>(80); // 80% idle waste eliminated

  // 12-Month Mathematical Projections calculation
  const projections = useMemo(() => {
    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'];
    
    // Savings multipliers
    const migrationDiscount = (modelMigrationPct / 100) * 0.45; // 45% savings on migrated traffic
    const riDiscount = (riCoveragePct / 100) * 0.30; // 30% savings on covered compute
    const idleDiscount = (idleCleanupPct / 100) * 0.15; // 15% overall waste reduction

    const totalOptimizationDiscount = Math.min(0.65, migrationDiscount + riDiscount + idleDiscount);

    const baselineData: number[] = [];
    const optimizedData: number[] = [];

    let currentBase = currentMonthlySpendUsd;
    let currentOpt = currentMonthlySpendUsd * (1 - totalOptimizationDiscount);

    let cumulativeBaselineUsd = 0;
    let cumulativeOptimizedUsd = 0;

    for (let i = 0; i < 12; i++) {
      baselineData.push(Number(currentBase.toFixed(2)));
      optimizedData.push(Number(currentOpt.toFixed(2)));

      cumulativeBaselineUsd += currentBase;
      cumulativeOptimizedUsd += currentOpt;

      // Apply Month-over-Month growth
      currentBase = currentBase * (1 + momGrowthRate / 100);
      currentOpt = currentOpt * (1 + momGrowthRate / 100);
    }

    const annualNetSavingsUsd = cumulativeBaselineUsd - cumulativeOptimizedUsd;

    return {
      months,
      baselineData,
      optimizedData,
      cumulativeBaselineUsd,
      cumulativeOptimizedUsd,
      annualNetSavingsUsd,
      totalOptimizationDiscountPct: (totalOptimizationDiscount * 100).toFixed(1)
    };
  }, [currentMonthlySpendUsd, momGrowthRate, modelMigrationPct, riCoveragePct, idleCleanupPct]);

  // Chart.js Data Config
  const chartData = {
    labels: projections.months,
    datasets: [
      {
        label: 'Unoptimized Baseline Growth ($USD)',
        data: projections.baselineData,
        borderColor: 'rgba(239, 68, 68, 0.9)', // Red Line
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      },
      {
        label: 'Optimized FinOps Curve ($USD)',
        data: projections.optimizedData,
        borderColor: 'rgba(16, 185, 129, 0.9)', // Emerald Line
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94A3B8', font: { size: 11, weight: 600 as const } }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        padding: 12,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency, 0, exchangeRates)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } } },
      y: {
        grid: { color: '#1E293B' },
        ticks: {
          color: '#94A3B8',
          callback: (val: any) => formatCurrency(val, currency, 0, exchangeRates)
        }
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              FinOps Financial Forecast & What-If Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Run client-side scenario simulations to project 12-month capital growth curves when migrating model tiers,
            enabling Reserved Instances, and executing idle cleanup.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/40 px-6 py-4 rounded-xl text-right shrink-0 shadow-lg relative z-10">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Projected 1-Year Net Capital Saved
          </p>
          <p className="text-3xl font-extrabold text-emerald-400 tracking-tight mt-0.5 font-mono">
            +{formatCurrency(projections.annualNetSavingsUsd, currency, 0, exchangeRates)}
          </p>
        </div>
      </div>

      {/* Main Content Grid: Sliders vs Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Scenario Variables</h3>
          </div>

          {/* MoM Growth Rate */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">MoM Organic Growth:</span>
              <span className="text-red-400 font-mono font-bold">+{momGrowthRate}% /mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={momGrowthRate}
              onChange={(e) => setMomGrowthRate(Number(e.target.value))}
              className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Model Migration Pct */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">LLM Tier Migration (GPT-4o → Mini/Haiku):</span>
              <span className="text-purple-400 font-mono font-bold">{modelMigrationPct}% Traffic</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={modelMigrationPct}
              onChange={(e) => setModelMigrationPct(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Reserved Instance Coverage */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Reserved Instance / Savings Plan:</span>
              <span className="text-indigo-400 font-mono font-bold">{riCoveragePct}% Covered</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={riCoveragePct}
              onChange={(e) => setRiCoveragePct(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Idle Waste Remediation */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Idle Server Waste Elimination:</span>
              <span className="text-emerald-400 font-mono font-bold">{idleCleanupPct}% Eliminated</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={idleCleanupPct}
              onChange={(e) => setIdleCleanupPct(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 12-Month Spending Curve Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">12-Month Spend Growth vs Optimized FinOps Projection</h3>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                {projections.totalOptimizationDiscountPct}% Net Cost Discount
              </span>
            </div>

            <div className="relative h-[360px] w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
