/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Interactive Topology & Architecture Map Component (Phase 10)
 * 
 * ============================================================================
 * LEARNING RESOURCES & REACTFLOW GRAPH CANVAS:
 * ============================================================================
 * 1. ReactFlow Interactive Canvas:
 *    https://reactflow.dev/docs/guides/getting-started/
 *    Renders interactive node-edge directed graph canvases with zoom/pan, controls,
 *    minimap, and edge animations.
 * ============================================================================
 */

import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  BackgroundVariant
} from 'reactflow';
import { useStore, getFilteredResources } from '../../store/useStore';
import type { OmniResource } from '../../types';
import { ResourceNode } from './ResourceNode';
import { Network, Zap, ShieldAlert } from 'lucide-react';

import 'reactflow/dist/style.css';

interface ArchitectureMapProps {
  onSelectResourceForKill?: (resource: OmniResource) => void;
}

export const ArchitectureMap: React.FC<ArchitectureMapProps> = ({ onSelectResourceForKill }) => {
  const rawResources = useStore((state) => state.resources);
  const activeTenantId = useStore((state) => state.activeTenantId);
  const resources = useMemo(() => getFilteredResources(rawResources, activeTenantId), [rawResources, activeTenantId]);
  const rawAlerts = useStore((state) => state.alerts);
  const alerts = useMemo(() => rawAlerts.filter((a) => !a.resolved), [rawAlerts]);
  const currency = useStore((state) => state.currency);
  const exchangeRates = useStore((state) => state.exchangeRates);

  // Register custom node types mapping
  const nodeTypes = useMemo(() => ({ resourceNode: ResourceNode }), []);

  // Build topological 4-tier directed graph nodes and edges from resources
  const { nodes, edges } = useMemo(() => {
    if (!resources || resources.length === 0) {
      return { nodes: [], edges: [] };
    }

    const anomalyResourceIds = new Set(alerts.map((a) => a.resourceId));

    // Sample top representative architecture assets for diagram rendering
    const cloudNodes = resources.filter((r) => r.type === 'CLOUD').slice(0, 8);
    const llmNodes = resources.filter((r) => r.type === 'LLM').slice(0, 8);

    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Tier 1: Cloud Gateway Entry Nodes (Y = 50)
    const gateways = cloudNodes.filter((r) => r.resourceType === 'NAT_GATEWAY' || r.resourceType === 'EC2_COMPUTE').slice(0, 2);
    gateways.forEach((res, i) => {
      const nodeId = res.id;
      generatedNodes.push({
        id: nodeId,
        type: 'resourceNode',
        position: { x: 150 + i * 400, y: 50 },
        data: {
          resource: res,
          isAnomaly: anomalyResourceIds.has(res.id),
          currency,
          rates: exchangeRates,
          onKillClick: onSelectResourceForKill
        }
      });
    });

    // Tier 2: Compute & Kubernetes Pods (Y = 240)
    const compute = cloudNodes.filter((r) => r.resourceType === 'K8S_NODE' || r.resourceType === 'EC2_COMPUTE').slice(0, 3);
    compute.forEach((res, i) => {
      const nodeId = res.id;
      generatedNodes.push({
        id: nodeId,
        type: 'resourceNode',
        position: { x: 80 + i * 320, y: 240 },
        data: {
          resource: res,
          isAnomaly: anomalyResourceIds.has(res.id),
          currency,
          rates: exchangeRates,
          onKillClick: onSelectResourceForKill
        }
      });

      // Connect Tier 1 -> Tier 2
      if (gateways.length > 0) {
        const parentGateway = gateways[i % gateways.length];
        generatedEdges.push({
          id: `edge-${parentGateway.id}-${nodeId}`,
          source: parentGateway.id,
          target: nodeId,
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' }
        });
      }
    });

    // Tier 3: Databases & Storage (Y = 430)
    const databases = cloudNodes.filter((r) => r.resourceType === 'RDS_DATABASE' || r.resourceType === 'S3_STORAGE').slice(0, 3);
    databases.forEach((res, i) => {
      const nodeId = res.id;
      generatedNodes.push({
        id: nodeId,
        type: 'resourceNode',
        position: { x: 120 + i * 320, y: 430 },
        data: {
          resource: res,
          isAnomaly: anomalyResourceIds.has(res.id),
          currency,
          rates: exchangeRates,
          onKillClick: onSelectResourceForKill
        }
      });

      // Connect Tier 2 -> Tier 3
      if (compute.length > 0) {
        const parentCompute = compute[i % compute.length];
        generatedEdges.push({
          id: `edge-${parentCompute.id}-${nodeId}`,
          source: parentCompute.id,
          target: nodeId,
          animated: true,
          style: { stroke: '#0EA5E9', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#0EA5E9' }
        });
      }
    });

    // Tier 4: Autonomous AI Agent Chains & LLMs (Y = 620)
    llmNodes.forEach((res, i) => {
      const nodeId = res.id;
      generatedNodes.push({
        id: nodeId,
        type: 'resourceNode',
        position: { x: 60 + i * 290, y: 620 },
        data: {
          resource: res,
          isAnomaly: anomalyResourceIds.has(res.id),
          currency,
          rates: exchangeRates,
          onKillClick: onSelectResourceForKill
        }
      });

      // Connect Tier 3 Databases / Tier 2 Compute -> Tier 4 LLM Agent
      const parentSource = databases[i % databases.length] || compute[i % compute.length];
      if (parentSource) {
        generatedEdges.push({
          id: `edge-${parentSource.id}-${nodeId}`,
          source: parentSource.id,
          target: nodeId,
          animated: true,
          style: {
            stroke: anomalyResourceIds.has(res.id) ? '#EF4444' : '#A855F7',
            strokeWidth: anomalyResourceIds.has(res.id) ? 3 : 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: anomalyResourceIds.has(res.id) ? '#EF4444' : '#A855F7'
          }
        });
      }
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [resources, alerts, currency, exchangeRates, onSelectResourceForKill]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] relative">
      {/* Top Map Status Banner */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center z-10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Network className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-bold text-white text-sm">Interactive Cloud & AI Dependency Map</h3>
            <p className="text-[11px] text-slate-400">
              Live topological hierarchy: Gateways → Compute Nodes → Databases → AI LLM Chains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive Zoom / Pan Enabled</span>
          </div>

          {alerts.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{alerts.length} Anomaly Nodes Pulsing</span>
            </div>
          )}
        </div>
      </div>

      {/* ReactFlow Interactive Canvas */}
      <div className="flex-1 w-full h-full bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView={true}
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
          <Controls className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl" />
          <MiniMap
            nodeColor={(n) => {
              if (n.data?.isAnomaly) return '#EF4444';
              if (n.data?.resource?.type === 'LLM') return '#A855F7';
              return '#6366F1';
            }}
            maskColor="rgba(15, 23, 42, 0.8)"
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl"
          />
        </ReactFlow>
      </div>
    </div>
  );
};