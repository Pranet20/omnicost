/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Header with Multi-Tenant Vault Integration (Phase 18)
 */

import React, { useState, useMemo } from 'react';
import { useStore, type ThemeMode } from '../../store/useStore';
import { useRBAC } from '../../hooks/useRBAC';
import { formatCurrency, SUPPORTED_CURRENCIES, type CurrencyCode } from '../../utils/format';
import { generateExecutivePDFReport } from '../../utils/pdfExport';
import { CredentialVaultModal, DEFAULT_TENANTS } from '../vault/CredentialVaultModal';
import { 
  Bell, 
  Shield, 
  Zap, 
  Activity, 
  TrendingUp, 
  Download, 
  FileText,
  Globe,
  Printer,
  SunMedium,
  Moon,
  Eye,
  Key,
  Building,
  UploadCloud
} from 'lucide-react';

interface HeaderProps {
  onOpenAlerts: () => void;
  onOpenImporter?: () => void;
  onTriggerSpike?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAlerts, onOpenImporter, onTriggerSpike }) => {
  const resources = useStore((state) => state.resources);
  const auditLogs = useStore((state) => state.auditLogs);
  const rawAlerts = useStore((state) => state.alerts);
  const alerts = useMemo(() => rawAlerts.filter((a) => !a.resolved), [rawAlerts]);
  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);
  const theme = useStore((state) => state.theme);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const setCurrency = useStore((state) => state.setCurrency);
  const setTheme = useStore((state) => state.setTheme);
  const setActiveTenant = useStore((state) => state.setActiveTenant);
  const exportDataCSV = useStore((state) => state.exportDataCSV);
  const exportDataJSON = useStore((state) => state.exportDataJSON);
  const { role } = useRBAC();

  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const totalHourlyBurnUsd = resources.reduce((sum, r) => sum + r.hourlyCost, 0);

  const handleExportPDF = () => {
    generateExecutivePDFReport({
      resources,
      auditLogs,
      currency,
      rates: exchangeRates,
      userRole: role
    });
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <CredentialVaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <Activity className="w-3.5 h-3.5" />
          <span>Worker Stream: Live (2s)</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-300">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Total Burn Rate:</span>
          <span className="font-bold text-white font-mono">
            {formatCurrency(totalHourlyBurnUsd, currency, 2, exchangeRates)}/hr
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Tenant Vault Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 p-1 rounded-lg text-xs">
          <button
            onClick={() => setIsVaultOpen(true)}
            className="p-1 text-slate-400 hover:text-white"
            title="Open Multi-Tenant Credential Vault"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <select
            value={activeTenantId}
            onChange={(e) => setActiveTenant(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs pr-1"
            title="Switch Billing Tenant Account"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Organization Accounts</option>
            {DEFAULT_TENANTS.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
          {theme === 'DARK' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : theme === 'LIGHT' ? (
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeMode)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            title="Switch Theme Accessibility"
          >
            <option value="DARK" className="bg-slate-900 text-white">Dark Command</option>
            <option value="LIGHT" className="bg-slate-900 text-white">Light Enterprise</option>
            <option value="COLORBLIND" className="bg-slate-900 text-white">Colorblind High-Contrast</option>
          </select>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            title="Switch Global Display Currency"
          >
            {Object.values(SUPPORTED_CURRENCIES).map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Import & Export Tools */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          {onOpenImporter && (
            <button
              onClick={onOpenImporter}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-bold rounded transition-all border border-cyan-500/40"
              title="Upload Custom JSON or CSV Billing Dataset"
            >
              <UploadCloud className="w-3 h-3 text-cyan-400" />
              Import Data
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-bold rounded transition-all border border-indigo-500/40"
            title="Generate Printable Executive PDF Summary Report"
          >
            <Printer className="w-3 h-3 text-indigo-300" />
            PDF Report
          </button>

          <button
            onClick={exportDataCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 text-[11px] font-bold rounded transition-all"
            title="Export 5,000+ billing line items to CSV"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            CSV
          </button>

          <button
            onClick={exportDataJSON}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 text-[11px] font-bold rounded transition-all"
            title="Export full telemetry payload to JSON"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            JSON
          </button>
        </div>

        {/* Spike Trigger */}
        {onTriggerSpike && (
          <button
            onClick={onTriggerSpike}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-all"
            title="Inject artificial cost surge tick to test real-time alert triggers"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Inject Spike
          </button>
        )}

        {/* Alerts Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
          aria-label="Open Anomaly Alerts"
        >
          <Bell className="w-4 h-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white font-bold text-[10px] rounded-full animate-pulse">
              {alerts.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};