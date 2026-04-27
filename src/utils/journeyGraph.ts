// src/utils/journeyGraph.ts
// Pure graph utility functions for the journey builder canvas.
// All functions take immutable inputs and return new arrays (no mutation).

import type { JourneyNode, JourneyEdge } from '../models/journey';

/**
 * Detect whether adding a proposed edge would create a cycle in the graph.
 * Uses DFS from the proposed target node — returns true if it can reach
 * the proposed source node through existing edges.
 */
export function detectCycle(
  _nodes: JourneyNode[],
  edges: JourneyEdge[],
  proposedEdge: { sourceNodeId: string; targetNodeId: string },
): boolean {
  // Self-loop is always a cycle
  if (proposedEdge.sourceNodeId === proposedEdge.targetNodeId) {
    return true;
  }

  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (nodeId === proposedEdge.sourceNodeId) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);

    for (const edge of edges) {
      if (edge.sourceNodeId === nodeId) {
        if (dfs(edge.targetNodeId)) return true;
      }
    }
    return false;
  }

  return dfs(proposedEdge.targetNodeId);
}

/**
 * Split an existing edge and insert a new node between the two previously
 * connected nodes.
 *
 * Algorithm:
 * 1. Find the edge being dropped on (by targetEdgeId)
 * 2. Remove the original edge (A → B)
 * 3. Create two new edges: A → NewNode, NewNode → B
 */
export function autoConnect(
  nodes: JourneyNode[],
  edges: JourneyEdge[],
  newNode: JourneyNode,
  targetEdgeId: string,
): { nodes: JourneyNode[]; edges: JourneyEdge[] } {
  const targetEdge = edges.find((e) => e.id === targetEdgeId);
  if (!targetEdge) {
    // Edge not found — just add the node, leave edges unchanged
    return { nodes: [...nodes, newNode], edges: [...edges] };
  }

  const edgeAToNew: JourneyEdge = {
    id: `e-${targetEdge.sourceNodeId}-${newNode.id}`,
    sourceNodeId: targetEdge.sourceNodeId,
    targetNodeId: newNode.id,
    sourceHandle: targetEdge.sourceHandle,
  };

  const edgeNewToB: JourneyEdge = {
    id: `e-${newNode.id}-${targetEdge.targetNodeId}`,
    sourceNodeId: newNode.id,
    targetNodeId: targetEdge.targetNodeId,
    sourceHandle: 'default',
  };

  const updatedEdges = edges
    .filter((e) => e.id !== targetEdgeId)
    .concat(edgeAToNew, edgeNewToB);

  return {
    nodes: [...nodes, newNode],
    edges: updatedEdges,
  };
}

/**
 * When removing a node, reconnect upstream to downstream if possible.
 *
 * Algorithm:
 * - Non-branch node with exactly 1 incoming and 1 outgoing edge:
 *   create a new edge S → T, remove all edges referencing the deleted node.
 * - Otherwise (branch nodes with multiple outputs, or nodes with 0/many
 *   incoming): just remove all edges referencing the deleted node.
 */
export function autoHeal(
  nodes: JourneyNode[],
  edges: JourneyEdge[],
  removedNodeId: string,
): { nodes: JourneyNode[]; edges: JourneyEdge[] } {
  const incoming = edges.filter((e) => e.targetNodeId === removedNodeId);
  const outgoing = edges.filter((e) => e.sourceNodeId === removedNodeId);

  // Remove all edges that reference the deleted node
  const cleanedEdges = edges.filter(
    (e) => e.sourceNodeId !== removedNodeId && e.targetNodeId !== removedNodeId,
  );

  // Remove the node itself
  const cleanedNodes = nodes.filter((n) => n.id !== removedNodeId);

  // Non-branch heal: exactly one incoming and one outgoing → reconnect
  if (incoming.length === 1 && outgoing.length === 1) {
    const sourceId = incoming[0].sourceNodeId;
    const targetId = outgoing[0].targetNodeId;

    const healEdge: JourneyEdge = {
      id: `e-${sourceId}-${targetId}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      sourceHandle: incoming[0].sourceHandle,
    };

    return {
      nodes: cleanedNodes,
      edges: [...cleanedEdges, healEdge],
    };
  }

  // Branch or multi-connection case: just remove all edges, no reconnection
  return {
    nodes: cleanedNodes,
    edges: cleanedEdges,
  };
}
