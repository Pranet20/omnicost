/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Main App Shell (Phases 1 - 19)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import type { OmniResource } from './types';
import { formatCurrency } from './utils/format';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MetricCard } from './components/dashboard/MetricCard';
import { ResourceGrid } from './components/dashboard/ResourceGrid';
import { ArchitectureMap } from './components/topology/ArchitectureMap';
import { TokenDistributionChart } from './components/analytics/TokenDistributionChart';
import { SpendAllocationChart } from './components/analytics/SpendAllocationChart';
import { DepartmentSpendChart } from './components/analytics/DepartmentSpendChart';
import { PromptLoopSimulator } from './components/simulator/PromptLoopSimulator';
import { LivePromptEstimator } from './components/simulator/LivePromptEstimator';
import { ForecastCalculator } from './components/calculator/ForecastCalculator';
import { TagHygieneExplorer } from './components/tagging/TagHygieneExplorer';
import { RecommendationEngine } from './components/recommendations/RecommendationEngine';
import { RuleConfigurator } from './components/alerts/RuleConfigurator';
import { AlertDrawer } from './components/alerts/AlertDrawer';
import { AuditTrail } from './components/alerts/AuditTrail';
import { KillSwitchModal } from './components/remediation/KillSwitchModal';
import { ToastEngine } from './components/common/ToastEngine';
import { DataImporterModal } from './components/common/DataImporterModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useStore, getFilteredResources } from './store/useStore';
import { DollarSign, Cpu, MessageSquare, AlertTriangle, TableProperties, Network } from 'lucide-react';

export function App() {
  const { triggerSpike } = useTelemetry();

  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'TABLE' | 'TOPOLOGY'>('TABLE');
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [selectedResourceForKill, setSelectedResourceForKill] = useState<OmniResource | null>(null);

  const rawResources = useStore((state) => state.resources);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const resources = useMemo(() => getFilteredResources(rawResources, activeTenantId), [rawResources, activeTenantId]);

  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);
  const syncLiveExchangeRates = useStore((state) => state.syncLiveExchangeRates);
  const rawAlerts = useStore((state) => state.alerts);
  const activeAlerts = useMemo(() => rawAlerts.filter((a) => !a.resolved), [rawAlerts]);

  useEffect(() => {
    syncLiveExchangeRates();
  }, [syncLiveExchangeRates]);

  const totalSpendUsd = resources.reduce((sum, res) => sum + res.totalSpend, 0);
  const totalLlmTokens = resources
    .filter((r): r is Extract<OmniResource, { type: 'LLM' }> => r.type === 'LLM')
    .reduce((sum, res) => sum + res.metrics.promptTokens, 0);
  const activeCount = resources.filter((r) => r.status === 'ACTIVE').length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased relative">
      <ToastEngine onOpenAlerts={() => setIsAlertDrawerOpen(true)} />

      <DataImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
      />

      <AlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        onSelectResourceForKill={(res) => setSelectedResourceForKill(res)}
      />

      {selectedResourceForKill && (
        <KillSwitchModal
          resource={selectedResourceForKill}
          onClose={() => setSelectedResourceForKill(null)}
        />
      )}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header
          onOpenAlerts={() => setIsAlertDrawerOpen(true)}
          onOpenImporter={() => setIsImporterOpen(true)}
          onTriggerSpike={() => triggerSpike()}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'overview' && (
              <ErrorBoundary fallbackTitle="Overview Dashboard Error">
                <div className="space-y-8">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-wide">
                      Platform Observability Overview
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Unified FinOps & LLMOps real-time command center telemetry ({currency}).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      title={`Total Cumulative Spend (${currency})`}
                      value={formatCurrency(totalSpendUsd, currency, 0, exchangeRates)}
                      icon={DollarSign}
                      trend="up"
                      trendValue="+14% this month"
                      delay={0.1}
                    />
                    <MetricCard
                      title="LLM Prompt Tokens"
                      value={`${(totalLlmTokens / 1_000_000).toFixed(2)}M`}
                      subtitle="Aggregated API Token Telemetry"
                      icon={MessageSquare}
                      delay={0.2}
                    />
                    <MetricCard
                      title="Active Compute Assets"
                      value={activeCount.toString()}
                      subtitle="EC2, RDS, K8s & LLM Models"
                      icon={Cpu}
                      delay={0.3}
                    />
                    <div onClick={() => setIsAlertDrawerOpen(true)} className="cursor-pointer">
                      <MetricCard
                        title="Critical Anomaly Alerts"
                        value={activeAlerts.length.toString()}
                        icon={AlertTriangle}
                        trend={activeAlerts.length > 0 ? 'up' : 'neutral'}
                        trendValue={activeAlerts.length > 0 ? 'Click to Resolve' : 'All Systems Clear'}
                        delay={0.4}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <h2 className="text-sm font-bold text-slate-300">Live Resource Observability</h2>
                    <div className="bg-slate-900 p-1 border border-slate-800 rounded-xl flex items-center gap-1">
                      <button
                        onClick={() => setViewMode('TABLE')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'TABLE'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <TableProperties className="w-3.5 h-3.5" />
                        DATA GRID
                      </button>
                      <button
                        onClick={() => setViewMode('TOPOLOGY')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'TOPOLOGY'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Network className="w-3.5 h-3.5 text-purple-400" />
                        ARCHITECTURE MAP
                      </button>
                    </div>
                  </div>

                  {viewMode === 'TABLE' ? (
                    <ResourceGrid
                      onSelectResourceForKill={(res) => setSelectedResourceForKill(res)}
                    />
                  ) : (
                    <ArchitectureMap
                      onSelectResourceForKill={(res) => setSelectedResourceForKill(res)}
                    />
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SpendAllocationChart />
                    <TokenDistributionChart />
                  </div>

                  <AuditTrail />
                </div>
              </ErrorBoundary>
            )}

            {activeTab === 'grid' && (
              <ErrorBoundary fallbackTitle="AG Grid Engine Error">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">High-Performance Data Grid</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      DOM Virtualized table sorting and filtering over 5,000+ billing line items ({currency}).
                    </p>
                  </div>
                  <ResourceGrid
                    onSelectResourceForKill={(res) => setSelectedResourceForKill(res)}
                  />
                </div>
              </ErrorBoundary>
            )}

            {activeTab === 'token-charts' && (
              <ErrorBoundary fallbackTitle="Token Analytics Error">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">Token Intelligence & Analytics</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Visualizing AI token ratios, prompt caching efficiencies, and department spending.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TokenDistributionChart />
                    <DepartmentSpendChart />
                  </div>
                  <SpendAllocationChart />
                </div>
              </ErrorBoundary>
            )}

            {activeTab === 'simulator' && (
              <ErrorBoundary fallbackTitle="AI Prompt Simulator Error">
                <PromptLoopSimulator />
              </ErrorBoundary>
            )}

            {activeTab === 'estimator' && (
              <ErrorBoundary fallbackTitle="Live Prompt Estimator Error">
                <LivePromptEstimator />
              </ErrorBoundary>
            )}

            {activeTab === 'calculator' && (
              <ErrorBoundary fallbackTitle="Forecast Calculator Error">
                <ForecastCalculator />
              </ErrorBoundary>
            )}

            {activeTab === 'tagging' && (
              <ErrorBoundary fallbackTitle="Tagging Hygiene Error">
                <TagHygieneExplorer />
              </ErrorBoundary>
            )}

            {activeTab === 'recommendations' && (
              <ErrorBoundary fallbackTitle="AI Recommendation Engine Error">
                <RecommendationEngine
                  onSelectResourceForKill={(res) => setSelectedResourceForKill(res)}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'anomalies' && (
              <ErrorBoundary fallbackTitle="Anomaly Rule Engine Error">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">Anomaly Detection Center</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage real-time threshold detection rules and review active alerts.
                    </p>
                  </div>
                  <RuleConfigurator />
                </div>
              </ErrorBoundary>
            )}

            {activeTab === 'audit' && (
              <ErrorBoundary fallbackTitle="Audit Trail Error">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">SOC-2 Audit & Remediation Log</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Immutable record of administrative Kill Switch overrides and dollar savings.
                    </p>
                  </div>
                  <AuditTrail />
                </div>
              </ErrorBoundary>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;