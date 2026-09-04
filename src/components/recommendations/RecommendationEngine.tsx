/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * AI FinOps Recommendation Engine with Multi-Currency Support (Phase 9)
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useRBAC } from '../../hooks/useRBAC';
import type { AIRecommendation, OmniResource } from '../../types';
import { formatCurrency } from '../../utils/format';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  ArrowRight, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';

interface RecommendationEngineProps {
  onSelectResourceForKill?: (resource: OmniResource) => void;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ onSelectResourceForKill }) => {
  const resources = useStore((state) => state.resources);
  const currency = useStore((state) => state.currency);
  const remediateResource = useStore((state) => state.remediateResource);
  const { canKillResource, role } = useRBAC();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const { recommendations, totalPotentialSavings } = useMemo(() => {
    const recs: AIRecommendation[] = [];

    resources.forEach((r) => {
      if (r.status === 'TERMINATED') return;

      if (r.type === 'CLOUD' && (r.status === 'IDLE' || r.metrics.cpuUtilization < 5.0)) {
        const monthlySavingsUsd = Number((r.hourlyCost * 24 * 30).toFixed(2));
        recs.push({
          id: `rec-idle-${r.id}`,
          resourceId: r.id,
          category: 'IDLE_CLEANUP',
          title: `Terminate Idle Server: ${r.name}`,
          description: `CPU utilization has remained at ${r.metrics.cpuUtilization}% for over 48h. Terminating eliminates zero-value spend.`,
          potentialMonthlySavings: monthlySavingsUsd,
          confidenceScore: 98,
          impact: monthlySavingsUsd > 500 ? 'HIGH' : 'MEDIUM',
          suggestedAction: 'TERMINATE'
        });
      }

      if (r.type === 'LLM' && r.metrics.cacheHitRate < 15.0 && r.metrics.promptTokens > 100000) {
        const monthlySavingsUsd = Number((r.totalSpend * 0.40).toFixed(2));
        recs.push({
          id: `rec-cache-${r.id}`,
          resourceId: r.id,
          category: 'TOKEN_CACHING',
          title: `Enable Prompt Caching on ${r.modelName}`,
          description: `Current cache hit rate is ${r.metrics.cacheHitRate}%. Enabling prompt caching saves up to 40% on prompt input tokens.`,
          potentialMonthlySavings: monthlySavingsUsd,
          confidenceScore: 92,
          impact: monthlySavingsUsd > 1000 ? 'HIGH' : 'MEDIUM',
          suggestedAction: 'ENABLE_CACHING'
        });
      }

      if (r.type === 'CLOUD' && r.metrics.memoryUtilization < 20.0 && r.hourlyCost > 1.50) {
        const monthlySavingsUsd = Number((r.hourlyCost * 24 * 30 * 0.50).toFixed(2));
        recs.push({
          id: `rec-size-${r.id}`,
          resourceId: r.id,
          category: 'RIGHT_SIZING',
          title: `Right-Size Instance Class: ${r.name}`,
          description: `Memory utilization is averaging ${r.metrics.memoryUtilization}%. Downsizing tier cuts costs by 50%.`,
          potentialMonthlySavings: monthlySavingsUsd,
          confidenceScore: 88,
          impact: 'MEDIUM',
          suggestedAction: 'RESIZE'
        });
      }
    });

    const totalSavingsUsd = recs.reduce((sum, item) => sum + item.potentialMonthlySavings, 0);

    return { recommendations: recs, totalPotentialSavings: totalSavingsUsd };
  }, [resources]);

  const filteredRecs = useMemo(() => {
    if (activeCategory === 'ALL') return recommendations;
    return recommendations.filter((r) => r.category === activeCategory);
  }, [recommendations, activeCategory]);

  const handleApplyAction = (rec: AIRecommendation) => {
    const target = resources.find((r) => r.id === rec.resourceId);
    if (!target) return;

    if (rec.suggestedAction === 'TERMINATE' && onSelectResourceForKill) {
      onSelectResourceForKill(target);
    } else {
      remediateResource(rec.resourceId, 'THROTTLE', role, 'AI_FINOPS_RECOMMENDATION_APPLIED');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900/90 via-purple-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              AI FinOps Recommendation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Real-time automated audit analyzing 5,000+ infrastructure nodes and LLM agents.
            Identifies idle cloud waste, uncached token loops, and right-sizing opportunities.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-indigo-500/40 px-6 py-4 rounded-xl text-right shrink-0 shadow-lg relative z-10">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Identified Monthly Savings
          </p>
          <p className="text-3xl font-extrabold text-emerald-400 tracking-tight mt-0.5 font-mono">
            {formatCurrency(totalPotentialSavings, currency)}
            <span className="text-xs font-normal text-slate-400"> /mo</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'ALL'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          All Opportunities ({recommendations.length})
        </button>

        <button
          onClick={() => setActiveCategory('IDLE_CLEANUP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCategory === 'IDLE_CLEANUP'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Idle Infrastructure Cleanup
        </button>

        <button
          onClick={() => setActiveCategory('TOKEN_CACHING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCategory === 'TOKEN_CACHING'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          Prompt Caching Optimization
        </button>

        <button
          onClick={() => setActiveCategory('RIGHT_SIZING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCategory === 'RIGHT_SIZING'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          Right-Sizing Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            <ShieldCheck className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">All Resources Optimized</p>
            <p className="text-xs text-slate-500 mt-1">No additional financial waste detected in this category.</p>
          </div>
        ) : (
          filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                      rec.impact === 'HIGH'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {rec.impact} IMPACT
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {rec.confidenceScore}% AI Confidence
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm leading-snug group-hover:text-cyan-300 transition-colors">
                  {rec.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Estimated Savings</p>
                  <p className="text-base font-extrabold text-emerald-400 font-mono">
                    +{formatCurrency(rec.potentialMonthlySavings, currency)}/mo
                  </p>
                </div>

                <button
                  onClick={() => handleApplyAction(rec)}
                  disabled={!canKillResource}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    !canKillResource
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                  title={!canKillResource ? 'Requires ADMIN privileges' : 'Apply AI Recommendation'}
                >
                  <span>Apply Fix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
