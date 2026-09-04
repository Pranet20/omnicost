/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Off-Thread Telemetry Ingestion Worker (Phase 2)
 * 
 * ============================================================================
 * LEARNING RESOURCES & WEB WORKERS API:
 * ============================================================================
 * 1. Web Workers API (MDN):
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
 *    Runs scripts in background threads, keeping the React UI running smoothly at 60 FPS
 *    even when calculating financial telemetry over 5,000+ resources.
 * 
 * 2. Worker.postMessage() & Transferable Objects:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
 *    Communicates serialized telemetry JSON objects back to the main UI thread.
 * ============================================================================
 */

import type { TelemetryTickPayload } from '../types';

let timer: ReturnType<typeof setInterval> | null = null;
let tickIntervalMs = 2000; // Emit ticks every 2 seconds

// List of active resource IDs to inject ticks into
let activeResourceIds: string[] = [];

/**
 * Handle incoming control messages from the main React UI thread.
 */
self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT':
      activeResourceIds = payload.resourceIds || [];
      startTelemetryStream();
      break;

    case 'UPDATE_IDS':
      activeResourceIds = payload.resourceIds || [];
      break;

    case 'SET_INTERVAL':
      tickIntervalMs = payload.intervalMs;
      if (timer) {
        stopTelemetryStream();
        startTelemetryStream();
      }
      break;

    case 'TRIGGER_SPIKE':
      // Force an immediate runaway LLM / Cloud cost spike anomaly for testing
      injectRunawaySpike(payload.resourceId);
      break;

    case 'STOP':
      stopTelemetryStream();
      break;

    default:
      console.warn('[TelemetryWorker] Unknown message type:', type);
  }
};

let spikeTimer: ReturnType<typeof setInterval> | null = null;
const FIVE_MINUTES_MS = 300000; // 5 minutes

/**
 * Starts the recurring 2-second telemetry tick generator & 5-minute spike generator.
 */
function startTelemetryStream() {
  if (timer) clearInterval(timer);
  if (spikeTimer) clearInterval(spikeTimer);

  // Standard telemetry stream every 2 seconds
  timer = setInterval(() => {
    if (activeResourceIds.length === 0) return;

    // Pick 5 to 15 random resources to update per tick
    const sampleSize = Math.min(activeResourceIds.length, Math.floor(5 + Math.random() * 10));
    const updates: TelemetryTickPayload['updates'] = [];

    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * activeResourceIds.length);
      const resourceId = activeResourceIds[randomIndex];

      const costTick = Number((0.02 + Math.random() * 0.35).toFixed(2)); // Standard tick ($0.02 - $0.35)

      updates.push({
        resourceId,
        costTick,
        newCpu: Number((10 + Math.random() * 85).toFixed(1)),
        newTokens: Math.floor(1000 + Math.random() * 50000),
        isSpike: false
      });
    }

    const payload: TelemetryTickPayload = {
      timestamp: new Date().toISOString(),
      updates
    };

    // Post data back to React main thread
    self.postMessage({ type: 'TELEMETRY_TICK', payload });
  }, tickIntervalMs);

  // Dedicated 5-minute automated financial surge spike trigger
  spikeTimer = setInterval(() => {
    if (activeResourceIds.length > 0) {
      injectRunawaySpike();
    }
  }, FIVE_MINUTES_MS);
}

/**
 * Stops the telemetry timers.
 */
function stopTelemetryStream() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (spikeTimer) {
    clearInterval(spikeTimer);
    spikeTimer = null;
  }
}

/**
 * Manually injects an immediate runaway cost anomaly payload.
 */
function injectRunawaySpike(targetResourceId?: string) {
  const targetId = targetResourceId || activeResourceIds[Math.floor(Math.random() * activeResourceIds.length)];
  if (!targetId) return;

  const payload: TelemetryTickPayload = {
    timestamp: new Date().toISOString(),
    updates: [{
      resourceId: targetId,
      costTick: 48.75, // $48.75 spike!
      newCpu: 99.4,
      newTokens: 2500000,
      isSpike: true
    }]
  };

  self.postMessage({ type: 'TELEMETRY_TICK', payload });
}