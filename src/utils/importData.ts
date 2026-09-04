/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Dynamic JSON & CSV Data Parser / Importer Utility
 */

import type { OmniResource, Provider, ResourceStatus, CostCenter } from '../types';

export interface ImportResult {
  success: boolean;
  resources: OmniResource[];
  error?: string;
  count: number;
}

export function parseImportedData(rawContent: string, fileName: string): ImportResult {
  const trimmed = rawContent.trim();
  if (!trimmed) {
    return { success: false, resources: [], error: 'Uploaded file is empty.', count: 0 };
  }

  // Attempt JSON parsing
  if (fileName.endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      const validResources: OmniResource[] = items.map((item, idx) => normalizeResourceItem(item, idx));
      return { success: true, resources: validResources, count: validResources.length };
    } catch (e: any) {
      return { success: false, resources: [], error: `JSON Parse Error: ${e.message}`, count: 0 };
    }
  }

  // Attempt CSV parsing
  try {
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, resources: [], error: 'CSV file must contain a header row and at least one data row.', count: 0 };
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const resources: OmniResource[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length === 0) continue;

      const rowObj: Record<string, string> = {};
      headers.forEach((h, colIdx) => {
        rowObj[h] = row[colIdx] ? row[colIdx].trim() : '';
      });

      resources.push(normalizeResourceFromCSV(rowObj, i));
    }

    return { success: true, resources, count: resources.length };
  } catch (e: any) {
    return { success: false, resources: [], error: `CSV Parse Error: ${e.message}`, count: 0 };
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function normalizeResourceItem(item: any, idx: number): OmniResource {
  const id = item.id || `custom-res-${Date.now()}-${idx}`;
  const name = item.name || `Custom Resource ${idx + 1}`;
  const provider: Provider = (item.provider?.toUpperCase() || 'AWS') as Provider;
  const status: ResourceStatus = (item.status?.toUpperCase() || 'ACTIVE') as ResourceStatus;
  const costCenter: CostCenter = (item.costCenter?.toUpperCase() || 'ENGINEERING') as CostCenter;
  const hourlyCost = Number(item.hourlyCost) || 0.45;
  const totalSpend = Number(item.totalSpend) || Number((hourlyCost * 720).toFixed(2));
  const region = item.region || 'us-east-1';
  const tags = typeof item.tags === 'object' && item.tags !== null ? item.tags : { Environment: 'Custom', Owner: 'Import' };
  const type = item.type === 'LLM' || ['OPENAI', 'ANTHROPIC', 'COHERE', 'MISTRAL'].includes(provider) ? 'LLM' : 'CLOUD';

  if (type === 'LLM') {
    return {
      id,
      name,
      type: 'LLM',
      provider: provider as any,
      status,
      costCenter,
      hourlyCost,
      totalSpend,
      createdAt: item.createdAt || new Date().toISOString(),
      region,
      tags,
      modelName: item.modelName || name,
      metrics: item.metrics || {
        promptTokens: 450000,
        completionTokens: 120000,
        cachedTokens: 150000,
        latencyMs: 340,
        costPerQuery: 0.012
      }
    };
  }

  return {
    id,
    name,
    type: 'CLOUD',
    provider: provider as any,
    status,
    costCenter,
    hourlyCost,
    totalSpend,
    createdAt: item.createdAt || new Date().toISOString(),
    region,
    tags,
    resourceType: item.resourceType || 'EC2_COMPUTE',
    metrics: item.metrics || {
      cpuUtilization: 42.5,
      memoryUtilization: 58.2,
      networkIOMb: 124.5,
      diskReadWriteIOPS: 850
    }
  };
}

function normalizeResourceFromCSV(row: Record<string, string>, idx: number): OmniResource {
  const name = row['name'] || row['resourcename'] || row['asset'] || `CSV Resource ${idx}`;
  const providerRaw = (row['provider'] || row['vendor'] || 'AWS').toUpperCase();
  const isLLM = ['OPENAI', 'ANTHROPIC', 'COHERE', 'MISTRAL'].includes(providerRaw) || (row['type'] || '').toUpperCase() === 'LLM';
  const provider: Provider = (['AWS', 'GCP', 'AZURE', 'OPENAI', 'ANTHROPIC', 'COHERE', 'MISTRAL'].includes(providerRaw) ? providerRaw : 'AWS') as Provider;
  const status: ResourceStatus = (['ACTIVE', 'IDLE', 'CRITICAL', 'THROTTLED', 'TERMINATED'].includes((row['status'] || '').toUpperCase()) ? row['status'].toUpperCase() : 'ACTIVE') as ResourceStatus;
  const costCenter: CostCenter = (['ENGINEERING', 'DATA_SCIENCE', 'PRODUCT', 'MARKETING', 'RESEARCH'].includes((row['costcenter'] || '').toUpperCase()) ? row['costcenter'].toUpperCase() : 'ENGINEERING') as CostCenter;

  const hourlyCost = parseFloat(row['hourlycost'] || row['rate'] || row['cost'] || '0.50') || 0.50;
  const totalSpend = parseFloat(row['totalspend'] || row['spend'] || row['total'] || '360.00') || 360.00;

  return normalizeResourceItem({
    id: row['id'] || `csv-${Date.now()}-${idx}`,
    name,
    provider,
    status,
    costCenter,
    hourlyCost,
    totalSpend,
    region: row['region'] || 'us-east-1',
    type: isLLM ? 'LLM' : 'CLOUD'
  }, idx);
}
