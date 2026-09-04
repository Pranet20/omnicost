/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * AI Agent Recursive Prompt Loop Simulator & Playground (Phase 11)
 * 
 * ============================================================================
 * LEARNING RESOURCES & SIMULATION MATH:
 * ============================================================================
 * 1. Anthropic Prompt Caching Guide:
 *    https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
 *    Explains how prompt caching reduces input token cost by up to 90% when agent
 *    chains repeatedly re-send system prompts and chat history.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { 
  Bot, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw,
  Sliders,
  Flame
} from 'lucide-react';

interface LLMModelPricing {
  name: string;
  provider: string;
  inputPerMillion: number;
  outputPerMillion: number;
  cachedPerMillion: number;
}

const MODEL_PRICING: Record<string, LLMModelPricing> = {
  'claude-3-5-sonnet': {
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    cachedPerMillion: 0.30 // 90% discount on cached tokens!
  },
  'gpt-4o': {
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputPerMillion: 2.50,
    outputPerMillion: 10.00,
    cachedPerMillion: 1.25 // 50% discount
  },
  'gpt-4o-mini': {
    name: 'OpenAI GPT-4o-mini',
    provider: 'OpenAI',
    inputPerMillion: 0.15,
    outputPerMillion: 0.60,
    cachedPerMillion: 0.075
  },
  'deepseek-r1': {
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    inputPerMillion: 0.55,
    outputPerMillion: 2.19,
    cachedPerMillion: 0.14
  }
};

export const PromptLoopSimulator: React.FC = () => {
  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);

  // Playground Interactive Controls
  const [selectedModelKey, setSelectedModelKey] = useState<string>('claude-3-5-sonnet');
  const [stepCount, setStepCount] = useState<number>(5);
  const [baseContextTokens, setBaseContextTokens] = useState<number>(16000); // 16k tokens
  const [tokensAddedPerStep, setTokensAddedPerStep] = useState<number>(4000); // 4k tokens/step
  const [outputTokensPerStep, setOutputTokensPerStep] = useState<number>(1000); // 1k tokens/step
  const [promptCachingEnabled, setPromptCachingEnabled] = useState<boolean>(true);
  const [requestsPerHour, setRequestsPerHour] = useState<number>(500);

  const selectedModel = MODEL_PRICING[selectedModelKey];

  // Mathematical Calculation of Token Accumulation & Cost Curves
  const simulation = useMemo(() => {
    const stepBreakdown: Array<{
      step: number;
      inputTokens: number;
      cachedTokens: number;
      uncachedTokens: number;
      outputTokens: number;
      costUsdWithoutCache: number;
      costUsdWithCache: number;
    }> = [];

    let accumContext = baseContextTokens;
    let totalInputTokens = 0;
    let totalCachedTokens = 0;
    let totalOutputTokens = 0;
    let totalCostWithoutCacheUsd = 0;
    let totalCostWithCacheUsd = 0;

    for (let i = 1; i <= stepCount; i++) {
      const stepInput = accumContext;
      // In step 1, prompt is cold. In steps 2+, system prompt + previous history is cached if caching is enabled.
      const stepCached = promptCachingEnabled && i > 1 ? Math.floor(accumContext * 0.80) : 0;
      const stepUncached = stepInput - stepCached;
      const stepOutput = outputTokensPerStep;

      // Cost calculation without prompt caching
      const stepCostNoCache =
        (stepInput / 1_000_000) * selectedModel.inputPerMillion +
        (stepOutput / 1_000_000) * selectedModel.outputPerMillion;

      // Cost calculation with prompt caching
      const stepCostCache =
        (stepUncached / 1_000_000) * selectedModel.inputPerMillion +
        (stepCached / 1_000_000) * selectedModel.cachedPerMillion +
        (stepOutput / 1_000_000) * selectedModel.outputPerMillion;

      stepBreakdown.push({
        step: i,
        inputTokens: stepInput,
        cachedTokens: stepCached,
        uncachedTokens: stepUncached,
        outputTokens: stepOutput,
        costUsdWithoutCache: stepCostNoCache,
        costUsdWithCache: stepCostCache
      });

      totalInputTokens += stepInput;
      totalCachedTokens += stepCached;
      totalOutputTokens += stepOutput;
      totalCostWithoutCacheUsd += stepCostNoCache;
      totalCostWithCacheUsd += stepCostCache;

      // Grow context for next recursive agent step
      accumContext += tokensAddedPerStep + stepOutput;
    }

    const costPerLoopUsd = promptCachingEnabled ? totalCostWithCacheUsd : totalCostWithoutCacheUsd;
    const monthlyCostUsd = costPerLoopUsd * requestsPerHour * 24 * 30;
    const monthlySavingsUsd = (totalCostWithoutCacheUsd - totalCostWithCacheUsd) * requestsPerHour * 24 * 30;

    return {
      stepBreakdown,
      totalInputTokens,
      totalCachedTokens,
      totalOutputTokens,
      costPerLoopUsd,
      monthlyCostUsd,
      monthlySavingsUsd: Math.max(0, monthlySavingsUsd),
      cacheEfficiencyPct: totalInputTokens > 0 ? ((totalCachedTokens / totalInputTokens) * 100).toFixed(1) : '0'
    };
  }, [
    selectedModel,
    stepCount,
    baseContextTokens,
    tokensAddedPerStep,
    outputTokensPerStep,
    promptCachingEnabled,
    requestsPerHour
  ]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              AI Agent Recursive Prompt Loop Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Simulate multi-step LLM autonomous agent loops. Visualize how recursive chat history expansion
            burns API tokens and how Anthropic & OpenAI Prompt Caching cuts monthly spend.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-purple-500/40 px-6 py-4 rounded-xl text-right shrink-0 shadow-lg relative z-10">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Projected Monthly API Cost
          </p>
          <p className="text-3xl font-extrabold text-purple-400 tracking-tight mt-0.5 font-mono">
            {formatCurrency(simulation.monthlyCostUsd, currency, 0, exchangeRates)}
            <span className="text-xs font-normal text-slate-400"> /mo</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Waterfall Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Simulation Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Agent Chain Parameters</h3>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">LLM Model Tier</label>
            <select
              value={selectedModelKey}
              onChange={(e) => setSelectedModelKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(MODEL_PRICING).map(([key, model]) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {model.name} (${model.inputPerMillion}/M in, ${model.outputPerMillion}/M out)
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Caching Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <p className="text-xs font-bold text-white">Prompt Caching</p>
              <p className="text-[10px] text-slate-400">Up to 90% input token cost reduction</p>
            </div>
            <button
              onClick={() => setPromptCachingEnabled(!promptCachingEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                promptCachingEnabled
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {promptCachingEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Step Count Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Recursive Steps per Loop:</span>
              <span className="text-indigo-400 font-mono font-bold">{stepCount} Steps</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={stepCount}
              onChange={(e) => setStepCount(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Initial Base Context Window Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Initial System Context:</span>
              <span className="text-purple-400 font-mono font-bold">{(baseContextTokens / 1000).toFixed(0)}k Tokens</span>
            </div>
            <input
              type="range"
              min="4000"
              max="64000"
              step="4000"
              value={baseContextTokens}
              onChange={(e) => setBaseContextTokens(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Tokens Added per Step Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Added Context per Step:</span>
              <span className="text-cyan-400 font-mono font-bold">{(tokensAddedPerStep / 1000).toFixed(1)}k Tokens</span>
            </div>
            <input
              type="range"
              min="1000"
              max="16000"
              step="1000"
              value={tokensAddedPerStep}
              onChange={(e) => setTokensAddedPerStep(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Execution Throughput per Hour */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Agent Executions / Hour:</span>
              <span className="text-emerald-400 font-mono font-bold">{requestsPerHour.toLocaleString()} req/hr</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={requestsPerHour}
              onChange={(e) => setRequestsPerHour(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Real-Time Token Waterfall & Caching Impact */}
        <div className="lg:col-span-2 space-y-6">
          {/* Caching Impact Alert Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Prompt Cache Savings Potential</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cache Efficiency: <strong className="text-emerald-400">{simulation.cacheEfficiencyPct}%</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Monthly Savings</p>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">
                +{formatCurrency(simulation.monthlySavingsUsd, currency, 0, exchangeRates)}/mo
              </p>
            </div>
          </div>

          {/* Step-by-Step Token Waterfall Visualizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Recursive Prompt Step Waterfall</h3>
              <span className="text-xs text-slate-400 font-mono">
                Cost per Loop: <strong className="text-white">{formatCurrency(simulation.costPerLoopUsd, currency, 4, exchangeRates)}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {simulation.stepBreakdown.map((step) => {
                const maxTokens = simulation.stepBreakdown[simulation.stepBreakdown.length - 1].inputTokens;
                const widthPct = Math.min(100, Math.max(10, (step.inputTokens / maxTokens) * 100));

                return (
                  <div key={step.step} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Step {step.step}</span>
                      <span className="text-slate-400">
                        Input: <strong className="text-purple-300">{(step.inputTokens / 1000).toFixed(0)}k</strong> | Cached:{' '}
                        <strong className="text-emerald-400">{(step.cachedTokens / 1000).toFixed(0)}k</strong>
                      </span>
                    </div>

                    <div className="h-4 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex">
                      {/* Uncached Portion */}
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${widthPct * (step.uncachedTokens / step.inputTokens)}%` }}
                        title={`Uncached Tokens: ${(step.uncachedTokens / 1000).toFixed(0)}k`}
                      />
                      {/* Cached Portion */}
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${widthPct * (step.cachedTokens / step.inputTokens)}%` }}
                        title={`Cached Tokens: ${(step.cachedTokens / 1000).toFixed(0)}k`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
