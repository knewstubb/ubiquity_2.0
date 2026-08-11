import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { JourneyDefinition, JourneyNode, JourneyEdge } from '../models/journey';
import { FIXED_START_ID, FIXED_END_ID } from '../models/journey';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useToast } from '../components/shared/Toast';
import * as journeysAdapter from '../lib/adapters/journeys-adapter';

const STORAGE_KEY = 'ubiquity-journeys';

interface JourneysContextValue {
  journeys: JourneyDefinition[];
  addJourney: (journey: JourneyDefinition) => void;
  updateJourney: (id: string, updates: Partial<JourneyDefinition>) => void;
  deleteJourney: (id: string) => void;
  updateNode: (journeyId: string, nodeId: string, updates: Partial<JourneyNode>) => void;
  addNode: (journeyId: string, node: JourneyNode) => void;
  removeNode: (journeyId: string, nodeId: string) => void;
  addEdge: (journeyId: string, edge: JourneyEdge) => void;
  removeEdge: (journeyId: string, edgeId: string) => void;
}

const JourneysContext = createContext<JourneysContextValue | undefined>(undefined);

function saveJourneys(journeys: JourneyDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
}

function loadJourneysFromStorage(): JourneyDefinition[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Ensures a journey has properly connected fixed Start/End nodes.
 * Also repairs journeys where Start/End exist but aren't wired.
 */
function ensureFixedNodes(journey: JourneyDefinition): JourneyDefinition {
  const hasStart = journey.nodes.some((n) => n.id === FIXED_START_ID);
  const hasEnd = journey.nodes.some((n) => n.id === FIXED_END_ID);

  // Find bounds of existing content nodes to position Start/End
  const contentNodes = journey.nodes.filter(
    (n) => n.id !== FIXED_START_ID && n.id !== FIXED_END_ID,
  );
  
  const minY = contentNodes.length > 0
    ? Math.min(...contentNodes.map((n) => n.position.y))
    : 100;
  const maxY = contentNodes.length > 0
    ? Math.max(...contentNodes.map((n) => n.position.y))
    : 100;
  const avgX = contentNodes.length > 0
    ? contentNodes.reduce((sum, n) => sum + n.position.x, 0) / contentNodes.length
    : 300;

  let migratedNodes = [...journey.nodes];
  let migratedEdges = [...journey.edges];

  // Add Start node if missing — position above all existing nodes
  if (!hasStart) {
    const startNode: JourneyNode = {
      id: FIXED_START_ID,
      type: 'start',
      subType: 'start',
      label: 'Start',
      position: { x: avgX, y: minY - 120 },
      config: { subType: 'start' },
    };
    migratedNodes = [startNode, ...migratedNodes];
  }

  // Add End node if missing — position below all existing nodes
  if (!hasEnd) {
    const endNode: JourneyNode = {
      id: FIXED_END_ID,
      type: 'fixed-end',
      subType: 'fixed-end',
      label: 'End',
      position: { x: avgX, y: maxY + 120 },
      config: { subType: 'fixed-end' },
    };
    migratedNodes = [...migratedNodes, endNode];
  }

  // Determine which nodes have edges
  const nodesWithIncoming = new Set(migratedEdges.map((e) => e.targetNodeId));
  const nodesWithOutgoing = new Set(migratedEdges.map((e) => e.sourceNodeId));

  // Check if Start has any outgoing edges
  const startHasOutgoing = nodesWithOutgoing.has(FIXED_START_ID);
  
  // Check if End has any incoming edges
  const endHasIncoming = nodesWithIncoming.has(FIXED_END_ID);

  // Find entry nodes (no incoming edges, excluding fixed nodes)
  const entryNodes = migratedNodes.filter(
    (n) => n.id !== FIXED_START_ID && n.id !== FIXED_END_ID && !nodesWithIncoming.has(n.id),
  );

  // Find exit nodes (no outgoing edges, excluding fixed nodes)
  const exitNodes = migratedNodes.filter(
    (n) => n.id !== FIXED_START_ID && n.id !== FIXED_END_ID && !nodesWithOutgoing.has(n.id),
  );

  // Connect Start → entry nodes if Start has no outgoing edges
  if (!startHasOutgoing && entryNodes.length > 0) {
    for (const entryNode of entryNodes) {
      const edgeId = `e-${FIXED_START_ID}-${entryNode.id}`;
      // Avoid duplicates
      if (!migratedEdges.some((e) => e.id === edgeId)) {
        migratedEdges.push({
          id: edgeId,
          sourceNodeId: FIXED_START_ID,
          targetNodeId: entryNode.id,
          sourceHandle: 'default',
        });
      }
    }
  }

  // Connect exit nodes → End if End has no incoming edges
  if (!endHasIncoming && exitNodes.length > 0) {
    for (const exitNode of exitNodes) {
      const edgeId = `e-${exitNode.id}-${FIXED_END_ID}`;
      // Avoid duplicates
      if (!migratedEdges.some((e) => e.id === edgeId)) {
        migratedEdges.push({
          id: edgeId,
          sourceNodeId: exitNode.id,
          targetNodeId: FIXED_END_ID,
          sourceHandle: 'default',
        });
      }
    }
  }

  // If no content nodes exist, connect Start → End directly
  if (contentNodes.length === 0) {
    const directEdgeId = `e-${FIXED_START_ID}-${FIXED_END_ID}`;
    if (!migratedEdges.some((e) => e.id === directEdgeId)) {
      migratedEdges.push({
        id: directEdgeId,
        sourceNodeId: FIXED_START_ID,
        targetNodeId: FIXED_END_ID,
        sourceHandle: 'default',
      });
    }
  }

  return {
    ...journey,
    nodes: migratedNodes,
    edges: migratedEdges,
    nodeCount: migratedNodes.length,
  };
}

/**
 * Migrate all journeys to ensure they have fixed Start/End nodes.
 */
function migrateJourneys(journeys: JourneyDefinition[]): JourneyDefinition[] {
  return journeys.map(ensureFixedNodes);
}

export function JourneysProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();

  const [journeys, setJourneys] = useState<JourneyDefinition[]>(() => {
    if (!supabaseMode) {
      const stored = loadJourneysFromStorage();
      if (stored !== null) return migrateJourneys(stored);
    }
    return migrateJourneys(dataLayer.journeyDefinitions);
  });

  useEffect(() => {
    if (!supabaseMode) {
      saveJourneys(journeys);
    }
  }, [journeys, supabaseMode]);

  const addJourney = useCallback((journey: JourneyDefinition): void => {
    setJourneys((prev) => [...prev, journey]);
    if (supabaseMode) {
      journeysAdapter.addJourney(journey).catch((err) => {
        showToast(err.message || 'Failed to add journey', 'error');
        setJourneys((prev) => prev.filter((j) => j.id !== journey.id));
      });
    }
  }, [supabaseMode, showToast]);

  const updateJourney = useCallback((id: string, updates: Partial<JourneyDefinition>): void => {
    setJourneys((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, ...updates } : j));
      if (supabaseMode) {
        journeysAdapter.updateJourney(id, updates).catch((err) => {
          showToast(err.message || 'Failed to update journey', 'error');
          setJourneys(prev);
        });
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const deleteJourney = useCallback((id: string): void => {
    setJourneys((prev) => {
      const filtered = prev.filter((j) => j.id !== id);
      if (supabaseMode) {
        journeysAdapter.deleteJourney(id).catch((err) => {
          showToast(err.message || 'Failed to delete journey', 'error');
          setJourneys(prev);
        });
      }
      return filtered;
    });
  }, [supabaseMode, showToast]);

  const updateNode = useCallback(
    (journeyId: string, nodeId: string, updates: Partial<JourneyNode>): void => {
      setJourneys((prev) =>
        prev.map((j) =>
          j.id === journeyId
            ? { ...j, nodes: j.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)) }
            : j,
        ),
      );
      if (supabaseMode) {
        journeysAdapter.updateNode(journeyId, nodeId, updates).catch((err) => {
          showToast(err.message || 'Failed to update node', 'error');
        });
      }
    },
    [supabaseMode, showToast],
  );

  const addNode = useCallback((journeyId: string, node: JourneyNode): void => {
    setJourneys((prev) =>
      prev.map((j) =>
        j.id === journeyId
          ? { ...j, nodes: [...j.nodes, node], nodeCount: j.nodes.length + 1 }
          : j,
      ),
    );
    if (supabaseMode) {
      journeysAdapter.addNode(journeyId, node).catch((err) => {
        showToast(err.message || 'Failed to add node', 'error');
      });
    }
  }, [supabaseMode, showToast]);

  const removeNode = useCallback((journeyId: string, nodeId: string): void => {
    setJourneys((prev) =>
      prev.map((j) =>
        j.id === journeyId
          ? { ...j, nodes: j.nodes.filter((n) => n.id !== nodeId), nodeCount: j.nodes.length - 1 }
          : j,
      ),
    );
    if (supabaseMode) {
      journeysAdapter.removeNode(journeyId, nodeId).catch((err) => {
        showToast(err.message || 'Failed to remove node', 'error');
      });
    }
  }, [supabaseMode, showToast]);

  const addEdge = useCallback((journeyId: string, edge: JourneyEdge): void => {
    setJourneys((prev) =>
      prev.map((j) =>
        j.id === journeyId ? { ...j, edges: [...j.edges, edge] } : j,
      ),
    );
    if (supabaseMode) {
      journeysAdapter.addEdge(journeyId, edge).catch((err) => {
        showToast(err.message || 'Failed to add edge', 'error');
      });
    }
  }, [supabaseMode, showToast]);

  const removeEdge = useCallback((journeyId: string, edgeId: string): void => {
    setJourneys((prev) =>
      prev.map((j) =>
        j.id === journeyId
          ? { ...j, edges: j.edges.filter((e) => e.id !== edgeId) }
          : j,
      ),
    );
    if (supabaseMode) {
      journeysAdapter.removeEdge(journeyId, edgeId).catch((err) => {
        showToast(err.message || 'Failed to remove edge', 'error');
      });
    }
  }, [supabaseMode, showToast]);

  return (
    <JourneysContext.Provider
      value={{
        journeys,
        addJourney,
        updateJourney,
        deleteJourney,
        updateNode,
        addNode,
        removeNode,
        addEdge,
        removeEdge,
      }}
    >
      {children}
    </JourneysContext.Provider>
  );
}

export function useJourneys(): JourneysContextValue {
  const context = useContext(JourneysContext);
  if (!context) {
    throw new Error('useJourneys must be used within a JourneysProvider');
  }
  return context;
}
