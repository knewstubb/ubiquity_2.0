import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { JourneyDefinition, JourneyNode, JourneyEdge } from '../models/journey';
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

export function JourneysProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();

  const [journeys, setJourneys] = useState<JourneyDefinition[]>(() => {
    if (!supabaseMode) {
      const stored = loadJourneysFromStorage();
      if (stored !== null) return stored;
    }
    return dataLayer.journeyDefinitions;
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
