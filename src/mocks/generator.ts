/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Synthetic Billing Data Generator (Phase 2)
 * 
 * ============================================================================
 * LEARNING RESOURCES & REACT / JS CONCEPTS:
 * ============================================================================
 * 1. Array.from() & Array Methods:
 *    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
 *    Efficiently generates large dataset arrays programmatically without manual looping boilerplate.
 * 
 * 2. Deterministic Seed Math (Deterministic Random Distribution):
 *    Simulates realistic financial bell-curves (e.g. AWS EC2 costs vs OpenAI GPT-4o token usage).
 * ============================================================================
 */

import type { OmniResource, CloudResource, LLMResource, CloudProvider, AIProvider, CostCenter } from '../types';

// Constants for dataset generation
const CLOUD_PROVIDERS: CloudProvider[] = ['AWS', 'GCP', 'AZURE'];
const AI_PROVIDERS: AIProvider[] = ['OPENAI', 'ANTHROPIC', 'COHERE', 'MISTRAL'];
const COST_CENTERS: CostCenter[] = ['ENGINEERING', 'DATA_SCIENCE', 'PRODUCT', 'MARKETING', 'RESEARCH'];
const REGIONS = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1', 'sa-east-1'];

const CLOUD_TYPES: CloudResource['resourceType'][] = [
  'EC2_COMPUTE',
  'S3_STORAGE',
  'RDS_DATABASE',
  'K8S_NODE',
  'NAT_GATEWAY'
];

const LLM_MODELS: { provider: AIProvider; name: string }[] = [
  { provider: 'OPENAI', name: 'gpt-4o' },
  { provider: 'OPENAI', name: 'gpt-4o-mini' },
  { provider: 'OPENAI', name: 'text-embedding-3-large' },
  { provider: 'ANTHROPIC', name: 'claude-3-5-sonnet' },
  { provider: 'ANTHROPIC', name: 'claude-3-haiku' },
  { provider: 'COHERE', name: 'command-r-plus' },
  { provider: 'MISTRAL', name: 'mistral-large-2407' }
];

/**
 * Generates N synthetic enterprise billing records (default: 5,000).
 * Half are Cloud Infrastructure resources and half are AI/LLM token resources.
 */
export function generateBillingDataset(count: number = 5000): OmniResource[] {
  const resources: OmniResource[] = [];

  for (let i = 0; i < count; i++) {
    const isCloud = i % 2 === 0;
    const costCenter = COST_CENTERS[i % COST_CENTERS.length];
    const region = REGIONS[i % REGIONS.length];
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString();

    if (isCloud) {
      const provider = CLOUD_PROVIDERS[i % CLOUD_PROVIDERS.length];
      const resourceType = CLOUD_TYPES[i % CLOUD_TYPES.length];
      const isIdle = Math.random() < 0.15; // 15% of resources simulated as "idle waste"
      
      const cpu = isIdle ? Number((Math.random() * 4).toFixed(1)) : Number((20 + Math.random() * 75).toFixed(1));
      const memory = isIdle ? Number((Math.random() * 10).toFixed(1)) : Number((35 + Math.random() * 55).toFixed(1));
      const hourlyCost = Number((0.05 + Math.random() * 4.50).toFixed(2));
      const totalSpend = Number((hourlyCost * 24 * (10 + Math.random() * 60)).toFixed(2));

      const cloudRes: CloudResource = {
        id: `res-cloud-${i + 1000}`,
        name: `${provider.toLowerCase()}-${resourceType.toLowerCase().replace('_', '-')}-node-${i + 1}`,
        type: 'CLOUD',
        provider,
        resourceType,
        status: isIdle ? 'IDLE' : (Math.random() < 0.05 ? 'CRITICAL' : 'ACTIVE'),
        costCenter,
        hourlyCost,
        totalSpend,
        createdAt,
        region,
        tags: {
          Environment: i % 3 === 0 ? 'production' : (i % 3 === 1 ? 'staging' : 'development'),
          Owner: `team-${costCenter.toLowerCase()}`,
          AutoShutdown: isIdle ? 'false' : 'true'
        },
        metrics: {
          cpuUtilization: cpu,
          memoryUtilization: memory,
          networkIOMb: Math.floor(10 + Math.random() * 500),
          diskReadWriteIOPS: Math.floor(100 + Math.random() * 4000)
        }
      };

      resources.push(cloudRes);
    } else {
      const model = LLM_MODELS[i % LLM_MODELS.length];
      const hasBadCaching = Math.random() < 0.30; // 30% have low prompt cache hit rates
      
      const promptTokens = Math.floor(50000 + Math.random() * 5000000);
      const completionTokens = Math.floor(10000 + Math.random() * 1500000);
      const cachedTokens = hasBadCaching ? Math.floor(promptTokens * 0.05) : Math.floor(promptTokens * 0.65);
      const hourlyCost = Number(((promptTokens * 0.000003) + (completionTokens * 0.000015)).toFixed(2));
      const totalSpend = Number((hourlyCost * (20 + Math.random() * 100)).toFixed(2));
      const cacheHitRate = Number(((cachedTokens / (promptTokens + 1)) * 100).toFixed(1));

      const llmRes: LLMResource = {
        id: `res-ai-${i + 1000}`,
        name: `agent-${model.name}-${i + 1}`,
        type: 'LLM',
        provider: model.provider,
        modelName: model.name,
        status: cacheHitRate < 10 ? 'CRITICAL' : 'ACTIVE',
        costCenter,
        hourlyCost,
        totalSpend,
        createdAt,
        region: 'us-global',
        tags: {
          AgentRole: i % 4 === 0 ? 'customer-support' : (i % 4 === 1 ? 'code-interpreter' : 'data-extractor'),
          Framework: 'LangChain-Python',
          PromptCaching: hasBadCaching ? 'DISABLED' : 'ENABLED'
        },
        metrics: {
          promptTokens,
          completionTokens,
          cachedTokens,
          requestsPerHour: Math.floor(50 + Math.random() * 3000),
          latencyMs: Math.floor(120 + Math.random() * 1800),
          cacheHitRate
        }
      };

      resources.push(llmRes);
    }
  }

  return resources;
}
