/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Enterprise AG Grid Implementation with Column Customizer (Phase 13)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  ClientSideRowModelModule, 
  ModuleRegistry, 
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  CellStyleModule
} from 'ag-grid-community';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useStore, getFilteredResources } from '../../store/useStore';
import { useRBAC } from '../../hooks/useRBAC';
import type { OmniResource } from '../../types';
import { formatCurrency, SUPPORTED_CURRENCIES } from '../../utils/format';
import { StatusRenderer } from '../grid/StatusRenderer';
import { MetricsRenderer } from '../grid/MetricsRenderer';
import { ProviderRenderer } from '../grid/ProviderRenderer';
import { 
  ColumnCustomizerDrawer, 
  type ColumnVisibilityState, 
  DEFAULT_COLUMN_VISIBILITY 
} from '../grid/ColumnCustomizerDrawer';
import { 
  Search, 
  Filter, 
  Flame, 
  Cloud, 
  Bot, 
  AlertTriangle, 
  Power,
  Columns
} from 'lucide-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const GRID_MODULES = [
  ClientSideRowModelModule, 
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  CellStyleModule
];

ModuleRegistry.registerModules(GRID_MODULES);

interface ResourceGridProps {
  onSelectResourceForKill?: (resource: OmniResource) => void;
}

export const ResourceGrid: React.FC<ResourceGridProps> = ({ onSelectResourceForKill }) => {
  const rawResources = useStore((state) => state.resources);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const resources = useMemo(() => getFilteredResources(rawResources, activeTenantId), [rawResources, activeTenantId]);
  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);
  const { canKillResource } = useRBAC();

  // Grid Controls & Column Customizer Drawer State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'CLOUD' | 'LLM' | 'IDLE' | 'CRITICAL'>('ALL');
  const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(DEFAULT_COLUMN_VISIBILITY);

  const handleToggleColumn = useCallback((colKey: keyof ColumnVisibilityState) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  }, []);

  const handleResetColumns = useCallback(() => {
    setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.costCenter.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (activeFilterTab) {
        case 'CLOUD':
          return res.type === 'CLOUD';
        case 'LLM':
          return res.type === 'LLM';
        case 'IDLE':
          return res.status === 'IDLE';
        case 'CRITICAL':
          return res.status === 'CRITICAL';
        default:
          return true;
      }
    });
  }, [resources, searchTerm, activeFilterTab]);

  const columnDefs = useMemo<ColDef<OmniResource>[]>(() => {
    const defs: ColDef<OmniResource>[] = [];

    if (columnVisibility.name) {
      defs.push({
        field: 'name',
        headerName: 'Resource Asset Name',
        flex: 1.5,
        minWidth: 220,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="flex flex-col justify-center h-full">
            <span className="font-bold text-white font-mono text-xs truncate">{params.value}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{params.data.id}</span>
          </div>
        )
      });
    }

    if (columnVisibility.provider) {
      defs.push({
        field: 'provider',
        headerName: 'Vendor',
        width: 140,
        cellRenderer: ProviderRenderer
      });
    }

    if (columnVisibility.costCenter) {
      defs.push({
        field: 'costCenter',
        headerName: 'Cost Center',
        width: 150,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="flex items-center h-full">
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 font-mono">
              {params.value}
            </span>
          </div>
        )
      });
    }

    if (columnVisibility.status) {
      defs.push({
        field: 'status',
        headerName: 'Health Status',
        width: 140,
        cellRenderer: StatusRenderer
      });
    }

    if (columnVisibility.metrics) {
      defs.push({
        field: 'metrics',
        headerName: 'Live Utilization Metrics',
        flex: 2,
        minWidth: 240,
        cellDataType: false,
        valueFormatter: (params) => {
          if (!params.value) return '';
          if ('cpuUtilization' in params.value) {
            return `CPU: ${params.value.cpuUtilization}%, Mem: ${params.value.memoryUtilization}%`;
          }
          if ('promptTokens' in params.value) {
            return `Prompt Tokens: ${params.value.promptTokens}, Completion: ${params.value.completionTokens}`;
          }
          return '';
        },
        cellRenderer: MetricsRenderer
      });
    }

    if (columnVisibility.hourlyCost) {
      defs.push({
        field: 'hourlyCost',
        headerName: `Hourly Rate (${currency})`,
        width: 150,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="flex items-center justify-end h-full font-mono text-xs font-bold text-indigo-300">
            {formatCurrency(params.value, currency, 2, exchangeRates)}/hr
          </div>
        )
      });
    }

    if (columnVisibility.totalSpend) {
      defs.push({
        field: 'totalSpend',
        headerName: `Cumulative Spend (${currency})`,
        width: 170,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="flex items-center justify-end h-full font-mono text-xs font-extrabold text-emerald-400">
            {formatCurrency(params.value, currency, 2, exchangeRates)}
          </div>
        )
      });
    }

    if (columnVisibility.region) {
      defs.push({
        field: 'region',
        headerName: 'Region / Location',
        width: 140,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="flex items-center h-full font-mono text-xs text-slate-400">
            {params.value}
          </div>
        )
      });
    }

    defs.push({
      headerName: 'Remediation',
      width: 130,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<OmniResource>) => {
        const res = params.data;
        if (!res || !canKillResource) {
          return (
            <div className="flex items-center justify-center h-full text-[10px] text-slate-600 font-semibold">
              Read-Only
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => onSelectResourceForKill?.(res)}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
              title="Trigger Emergency Remediation Kill Switch"
            >
              <Power className="w-3 h-3 text-red-400" />
              <span>Remediate</span>
            </button>
          </div>
        );
      }
    });

    return defs;
  }, [columnVisibility, currency, exchangeRates, canKillResource, onSelectResourceForKill]);

  return (
    <div className="space-y-4 font-sans">
      <ColumnCustomizerDrawer
        isOpen={isColumnCustomizerOpen}
        onClose={() => setIsColumnCustomizerOpen(false)}
        columnVisibility={columnVisibility}
        onToggleColumn={handleToggleColumn}
        onResetColumns={handleResetColumns}
      />

      {/* Grid Header Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 border border-slate-800 rounded-2xl shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 5,000+ resources by name, vendor, cost center..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsColumnCustomizerOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
            title="Open Column Customizer & Saved Views"
          >
            <Columns className="w-3.5 h-3.5 text-indigo-400" />
            <span>Customize Columns</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <button
            onClick={() => setActiveFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilterTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({resources.length})
          </button>

          <button
            onClick={() => setActiveFilterTab('CLOUD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilterTab === 'CLOUD'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            Cloud
          </button>

          <button
            onClick={() => setActiveFilterTab('LLM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilterTab === 'LLM'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            AI / LLM
          </button>

          <button
            onClick={() => setActiveFilterTab('IDLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilterTab === 'IDLE'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Idle
          </button>

          <button
            onClick={() => setActiveFilterTab('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilterTab === 'CRITICAL'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Critical
          </button>
        </div>
      </div>

      <div className="ag-theme-alpine-dark w-full h-[550px] rounded-xl overflow-hidden shadow-xl border border-slate-800">
        <AgGridReact<OmniResource>
          theme="legacy"
          modules={GRID_MODULES}
          rowData={filteredResources}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true
          }}
          pagination={true}
          paginationPageSize={50}
          rowBuffer={20}
          animateRows={true}
          rowHeight={56}
          getRowId={(params) => params.data.id}
        />
      </div>
    </div>
  );
};