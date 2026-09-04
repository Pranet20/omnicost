// src/mocks/db.ts
import type { OmniResource } from '../types';

export const mockResources: OmniResource[] = [
  {
    id: 'res-001',
    name: 'prod-api-gateway-node',
    provider: 'AWS',
    status: 'ACTIVE',
    costCenter: 'ENGINEERING',
    hourlyCost: 1.25,
    totalSpend: 450.00,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    type: 'CLOUD',
    resourceType: 'COMPUTE',
    metrics: { cpuUtilization: 12, memoryUtilization: 45, networkIOMb: 1024 }
  },
  {
    id: 'res-002',
    name: 'legacy-data-warehouse',
    provider: 'GCP',
    status: 'IDLE', // This is a FinOps target!
    costCenter: 'RESEARCH',
    hourlyCost: 4.50,
    totalSpend: 3240.00,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    type: 'CLOUD',
    resourceType: 'DATABASE',
    metrics: { cpuUtilization: 0.1, memoryUtilization: 5, networkIOMb: 2 }
  },
  {
    id: 'res-003',
    name: 'customer-support-bot',
    provider: 'OPENAI',
    status: 'ACTIVE',
    costCenter: 'PRODUCT',
    hourlyCost: 5.80,
    totalSpend: 1250.75,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    type: 'LLM',
    modelName: 'gpt-4-turbo',
    metrics: { promptTokens: 450000, completionTokens: 120000, cachedTokens: 80000, requestsPerHour: 340 }
  },
  {
    id: 'res-004',
    name: 'autonomous-research-agent',
    provider: 'ANTHROPIC',
    status: 'THROTTLED', // Was burning too much cash
    costCenter: 'RESEARCH',
    hourlyCost: 12.00,
    totalSpend: 5400.00,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'LLM',
    modelName: 'claude-3-opus',
    metrics: { promptTokens: 1200000, completionTokens: 400000, cachedTokens: 10000, requestsPerHour: 1200 }
  }
];