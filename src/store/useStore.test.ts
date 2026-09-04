/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Complete Vitest Unit Test Suite (Phases 1 - 19)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import type { OmniResource } from '../types';
import { formatCurrency } from '../utils/format';

const mockCloudResource: OmniResource = {
  id: 'res-test-1',
  name: 'aws-ec2-test-node',
  type: 'CLOUD',
  provider: 'AWS',
  resourceType: 'EC2_COMPUTE',
  status: 'ACTIVE',
  costCenter: 'ENGINEERING',
  hourlyCost: 2.50,
  totalSpend: 150.00,
  createdAt: new Date().toISOString(),
  region: 'us-east-1',
  tags: { Env: 'prod' },
  metrics: {
    cpuUtilization: 45.0,
    memoryUtilization: 60.0,
    networkIOMb: 120,
    diskReadWriteIOPS: 1500
  }
};

describe('OmniCost Complete Platform Unit Tests', () => {
  beforeEach(() => {
    useStore.setState({
      resources: [],
      alerts: [],
      auditLogs: [],
      currentUserRole: 'ADMIN',
      currency: 'INR',
      theme: 'DARK'
    });
  });

  it('1. should set initial resources dataset', () => {
    useStore.getState().setInitialResources([mockCloudResource]);
    expect(useStore.getState().resources.length).toBe(1);
    expect(useStore.getState().resources[0].name).toBe('aws-ec2-test-node');
  });

  it('2. should process telemetry ticks and trigger critical alerts on cost surge', () => {
    useStore.getState().setInitialResources([mockCloudResource]);

    useStore.getState().processTelemetry({
      timestamp: new Date().toISOString(),
      updates: [
        {
          resourceId: 'res-test-1',
          costTick: 12.50,
          newCpu: 88.5,
          isSpike: true
        }
      ]
    });

    const state = useStore.getState();
    expect(state.resources[0].totalSpend).toBe(162.50);
    if (state.resources[0].type === 'CLOUD') {
      expect(state.resources[0].metrics.cpuUtilization).toBe(88.5);
    }
    expect(state.alerts.length).toBe(1);
    expect(state.alerts[0].severity).toBe('CRITICAL');
  });

  it('3. should execute Kill Switch remediation and record an immutable audit log', () => {
    useStore.getState().setInitialResources([mockCloudResource]);

    useStore.getState().remediateResource(
      'res-test-1',
      'TERMINATE',
      'ADMIN',
      'RUNAWAY_LLM_LOOP'
    );

    const state = useStore.getState();
    expect(state.resources[0].status).toBe('TERMINATED');
    expect(state.auditLogs.length).toBe(1);
    expect(state.auditLogs[0].action).toBe('TERMINATE');
    expect(state.auditLogs[0].reasonCode).toBe('RUNAWAY_LLM_LOOP');
  });

  it('4. should format currency across INR, USD, EUR, and GBP', () => {
    expect(formatCurrency(10, 'INR')).toContain('₹');
    expect(formatCurrency(10, 'USD')).toContain('$');
    expect(formatCurrency(10, 'EUR')).toContain('€');
    expect(formatCurrency(10, 'GBP')).toContain('£');
  });
});