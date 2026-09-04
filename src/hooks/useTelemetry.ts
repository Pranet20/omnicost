/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Telemetry Ingestion Hook (Phase 2)
 * 
 * ============================================================================
 * LEARNING RESOURCES & REACT HOOKS:
 * ============================================================================
 * 1. React useEffect Hook:
 *    https://react.dev/reference/react/useEffect
 *    Handles side-effects (like Web Worker connections) and cleanup functions on unmount.
 * 
 * 2. React useRef Hook:
 *    https://react.dev/reference/react/useRef
 *    Holds a mutable reference to the Web Worker instance that persists across component re-renders
 *    without triggering unnecessary React state re-renders.
 * ============================================================================
 */

import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { generateBillingDataset } from '../mocks/generator';
import type { TelemetryTickPayload } from '../types';

export function useTelemetry() {
  const workerRef = useRef<Worker | null>(null);
  const setInitialResources = useStore((state) => state.setInitialResources);
  const processTelemetry = useStore((state) => state.processTelemetry);
  const resources = useStore((state) => state.resources);

  // 1. Initialize 5,000+ mock records into Zustand store on first load
  useEffect(() => {
    if (resources.length === 0) {
      const mockData = generateBillingDataset(5000);
      setInitialResources(mockData);
    }
  }, [resources.length, setInitialResources]);

  // 2. Instantiate and manage Web Worker life-cycle
  useEffect(() => {
    if (resources.length === 0) return;

    // Instantiate Web Worker off the main thread using Vite's worker loader
    const worker = new Worker(new URL('../workers/telemetry.worker.ts', import.meta.url), {
      type: 'module'
    });
    workerRef.current = worker;

    // Listen to tick events from the background thread
    worker.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'TELEMETRY_TICK') {
        const tickPayload = payload as TelemetryTickPayload;
        processTelemetry(tickPayload);
      }
    };

    // Send active resource IDs to the worker
    const resourceIds = resources.map((r) => r.id);
    worker.postMessage({
      type: 'INIT',
      payload: { resourceIds }
    });

    // Cleanup: Terminate worker on unmount to prevent browser memory leaks
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [resources.length > 0]); // Re-run once initial resources load

  // Return trigger function for manual anomaly injection (e.g. testing Kill Switch)
  const triggerSpike = (resourceId?: string) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'TRIGGER_SPIKE',
        payload: { resourceId }
      });
    }
  };

  return { triggerSpike };
}