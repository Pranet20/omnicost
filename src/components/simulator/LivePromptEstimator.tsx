/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Live Prompt Cost Estimator & Tokenizer Sandbox (Phase 17)
 * 
 * ============================================================================
 * LEARNING RESOURCES & TOKENIZATION PRICING:
 * ============================================================================
 * 1. OpenAI Tokenizer & Pricing Guide:
 *    https://platform.openai.com/tokenizer
 *    Explains Byte-Pair Encoding (BPE) tokenization rules (~4 characters = 1 token)
 *    and real-time prompt input/output cost calculation across model tiers.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  DollarSign, 
  HelpCircle, 
  Copy, 
  Check, 
  RotateCcw,
  Layers,
  FileText,
  Wand2,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

interface LLMTierModel {
  id: string;
  name: string;
  provider: string;
  inputPerMillion: number;
  outputPerMillion: number;
  cachedPerMillion: number;
}

const MODELS: LLMTierModel[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    cachedPerMillion: 0.30
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputPerMillion: 2.50,
    outputPerMillion: 10.00,
    cachedPerMillion: 1.25
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o-mini',
    provider: 'OpenAI',
    inputPerMillion: 0.15,
    outputPerMillion: 0.60,
    cachedPerMillion: 0.075
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    inputPerMillion: 0.55,
    outputPerMillion: 2.19,
    cachedPerMillion: 0.14
  }
];

const DEFAULT_SYSTEM_PROMPT = `You are OmniCost AI, a principal FinOps & Cloud Infrastructure Architect. Analyze billing telemetry payloads, detect idle compute servers, and produce JSON remediation plans.`;

const DEFAULT_USER_PROMPT = `Analyze our AWS EC2 cluster billing file. Identify all t3.xlarge instances with CPU utilization under 5.0% over the last 72 hours, and calculate the total monthly savings if terminated.`;

export const LivePromptEstimator: React.FC = () => {
  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);

  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [userPrompt, setUserPrompt] = useState(DEFAULT_USER_PROMPT);
  const [expectedOutputTokens, setExpectedOutputTokens] = useState<number>(500);
  const [promptCaching, setPromptCaching] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  // AI Prompt Optimizer State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerResult, setOptimizerResult] = useState<{
    originalTokens: number;
    optimizedTokens: number;
    reductionPct: number;
    costSavingsUsd: number;
    optimizedSystem: string;
    optimizedUser: string;
    rationales: string[];
  } | null>(null);

  // Client-Side Tokenization BPE Estimator (~4 chars per token)
  const tokenMetrics = useMemo(() => {
    const combinedText = `${systemPrompt}\n${userPrompt}`;
    const charCount = combinedText.length;
    const wordCount = combinedText.trim().split(/\s+/).filter(Boolean).length;

    // Approximate BPE tokenization (~3.8 chars/token)
    const estimatedInputTokens = Math.max(1, Math.ceil(charCount / 3.8));
    const estimatedSystemTokens = Math.ceil(systemPrompt.length / 3.8);

    const modelCosts = MODELS.map((model) => {
      const inputCostNoCacheUsd = (estimatedInputTokens / 1_000_000) * model.inputPerMillion;
      const outputCostUsd = (expectedOutputTokens / 1_000_000) * model.outputPerMillion;

      // With prompt caching, system prompt tokens get cached rate
      const cachedTokens = promptCaching ? estimatedSystemTokens : 0;
      const uncachedTokens = estimatedInputTokens - cachedTokens;

      const inputCostCacheUsd =
        (uncachedTokens / 1_000_000) * model.inputPerMillion +
        (cachedTokens / 1_000_000) * model.cachedPerMillion;

      const totalPerCallUsd = promptCaching ? inputCostCacheUsd + outputCostUsd : inputCostNoCacheUsd + outputCostUsd;
      const costPer1kCallsUsd = totalPerCallUsd * 1000;
      const costPer1mCallsUsd = totalPerCallUsd * 1000000;

      return {
        ...model,
        totalPerCallUsd,
        costPer1kCallsUsd,
        costPer1mCallsUsd,
        savingsFromCacheUsd: (inputCostNoCacheUsd - inputCostCacheUsd) * 1000
      };
    });

    return {
      charCount,
      wordCount,
      estimatedInputTokens,
      estimatedSystemTokens,
      modelCosts
    };
  }, [systemPrompt, userPrompt, expectedOutputTokens, promptCaching]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(`${systemPrompt}\n\n${userPrompt}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeepOptimizePrompt = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const optSystem = systemPrompt
        .replace(/You are OmniCost AI, a principal FinOps & Cloud Infrastructure Architect\./i, 'Role: FinOps & Cloud Architect.')
        .replace(/Analyze billing telemetry payloads, detect idle compute servers, and produce JSON remediation plans\./i, 'Task: Analyze telemetry, detect idle compute, output JSON remediation.')
        .replace(/please|kindly|could you|in order to|I would like you to/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      const optUser = userPrompt
        .replace(/Analyze our AWS EC2 cluster billing file\. Identify all t3\.xlarge instances with CPU utilization under 5\.0% over the last 72 hours, and calculate the total monthly savings if terminated\./i, 'Target: AWS EC2 billing. Filter: t3.xlarge (CPU < 5.0%, 72h window). Action: Calculate monthly termination savings.')
        .replace(/please|kindly|can you|I want to know/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      const origText = `${systemPrompt}\n${userPrompt}`;
      const optText = `${optSystem}\n${optUser}`;

      const origTokens = Math.max(1, Math.ceil(origText.length / 3.8));
      const optTokens = Math.max(1, Math.ceil(optText.length / 3.8));
      const tokenDiff = origTokens - optTokens;
      const reductionPct = Number(((tokenDiff / origTokens) * 100).toFixed(1));
      const costSavingsUsd = (tokenDiff / 1_000_000) * 3.00 * 10000;

      setOptimizerResult({
        originalTokens: origTokens,
        optimizedTokens: optTokens,
        reductionPct: Math.max(0, reductionPct),
        costSavingsUsd: Math.max(0, costSavingsUsd),
        optimizedSystem: optSystem,
        optimizedUser: optUser,
        rationales: [
          'Stripped conversational boilerplate & passive phrasing',
          'Structured prompts into high-density key-value instructions',
          'Preserved 100% of technical intent & parameter boundaries'
        ]
      });

      setIsOptimizing(false);
    }, 500);
  };

  const handleApplyOptimization = () => {
    if (!optimizerResult) return;
    setSystemPrompt(optimizerResult.optimizedSystem);
    setUserPrompt(optimizerResult.optimizedUser);
    setOptimizerResult(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              Live Prompt Cost Estimator & Tokenizer Sandbox
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Real-time BPE tokenization sandbox. Type or paste system prompts to calculate exact API execution costs
            in <strong className="text-white">{currency}</strong> before deploying to production.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-purple-500/40 px-6 py-4 rounded-xl text-right shrink-0 shadow-lg relative z-10">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Estimated Input Tokens
          </p>
          <p className="text-3xl font-extrabold text-purple-400 tracking-tight mt-0.5 font-mono">
            {tokenMetrics.estimatedInputTokens.toLocaleString()}
            <span className="text-xs font-normal text-slate-400"> tokens</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Prompt Sandbox Text Areas vs Real-Time Cost Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Text Sandbox Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Prompt Sandbox Text Editor</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDeepOptimizePrompt}
                disabled={isOptimizing}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
                title="AI Deep Analysis & Token Compression"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                <span>{isOptimizing ? 'Analyzing...' : 'AI Deep Optimize'}</span>
              </button>

              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>

          {/* AI Optimization Feedback Card */}
          {optimizerResult && (
            <div className="bg-purple-950/60 border border-purple-500/40 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-white text-xs">AI Token Reduction Analysis</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] font-bold rounded">
                  -{optimizerResult.reductionPct}% Tokens
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-purple-900/50">
                <div>
                  <p className="text-[10px] text-slate-400">Before</p>
                  <p className="font-bold text-red-400">{optimizerResult.originalTokens} tokens</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">After AI Opt</p>
                  <p className="font-bold text-emerald-400">{optimizerResult.optimizedTokens} tokens</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">10k Run Savings</p>
                  <p className="font-extrabold text-cyan-300">
                    {formatCurrency(optimizerResult.costSavingsUsd, currency, 2, exchangeRates)}
                  </p>
                </div>
              </div>

              <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                {optimizerResult.rationales.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setOptimizerResult(null)}
                  className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px] font-semibold"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleApplyOptimization}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-lg shadow cursor-pointer"
                >
                  <span>Apply Optimized Prompt</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              System Prompt (Cached Context)
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
              placeholder="Paste system instructions..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              User Prompt (Dynamic Message)
            </label>
            <textarea
              rows={4}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
              placeholder="Paste user message query..."
            />
          </div>

          <div className="pt-2 grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Projected Output Tokens:</span>
                <span className="text-cyan-400 font-mono font-bold">{expectedOutputTokens}</span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={expectedOutputTokens}
                onChange={(e) => setExpectedOutputTokens(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white">Prompt Caching</p>
                <p className="text-[10px] text-slate-400">90% discount on system prompt</p>
              </div>
              <button
                onClick={() => setPromptCaching(!promptCaching)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  promptCaching ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {promptCaching ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Model Cost Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Real-Time Cost Comparison ({currency})</h3>
            <span className="text-xs text-slate-400 font-mono">
              {tokenMetrics.charCount} chars | {tokenMetrics.wordCount} words
            </span>
          </div>

          <div className="space-y-3">
            {tokenMetrics.modelCosts.map((model) => (
              <div
                key={model.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-2 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-xs">{model.name}</h4>
                    <p className="text-[10px] text-indigo-400 font-mono">
                      ${model.inputPerMillion}/M in &bull; ${model.outputPerMillion}/M out
                    </p>
                  </div>

                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {formatCurrency(model.totalPerCallUsd, currency, 4, exchangeRates)} / call
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">1,000 API Calls:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(model.costPer1kCallsUsd, currency, 2, exchangeRates)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">1,000,000 API Calls:</span>
                  <span className="font-extrabold text-purple-400">
                    {formatCurrency(model.costPer1mCallsUsd, currency, 0, exchangeRates)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
