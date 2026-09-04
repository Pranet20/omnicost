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
    region: 'us-east-1',
    tags: { Environment: 'Production' },
    type: 'CLOUD',
    resourceType: 'EC2_COMPUTE',
    metrics: { cpuUtilization: 12, memoryUtilization: 45, networkIOMb: 1024, diskReadWriteIOPS: 850 }
  },
  {
    id: 'res-002',
    name: 'legacy-data-warehouse',
    provider: 'GCP',
    status: 'IDLE',
    costCenter: 'RESEARCH',
    hourlyCost: 4.50,
    totalSpend: 3240.00,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    region: 'us-west1',
    tags: { Environment: 'Staging' },
    type: 'CLOUD',
    resourceType: 'RDS_DATABASE',
    metrics: { cpuUtilization: 0.1, memoryUtilization: 5, networkIOMb: 2, diskReadWriteIOPS: 100 }
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
    region: 'us-east-1',
    tags: { Model: 'gpt-4o' },
    type: 'LLM',
    modelName: 'gpt-4-turbo',
    metrics: { promptTokens: 450000, completionTokens: 120000, cachedTokens: 80000, requestsPerHour: 340, latencyMs: 250, cacheHitRate: 85 }
  },
  {
    id: 'res-004',
    name: 'autonomous-research-agent',
    provider: 'ANTHROPIC',
    status: 'THROTTLED',
    costCenter: 'RESEARCH',
    hourlyCost: 12.00,
    totalSpend: 5400.00,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    region: 'us-east-1',
    tags: { Model: 'claude-3-opus' },
    type: 'LLM',
    modelName: 'claude-3-opus',
    metrics: { promptTokens: 1200000, completionTokens: 400000, cachedTokens: 10000, requestsPerHour: 1200, latencyMs: 850, cacheHitRate: 40 }
  }
];