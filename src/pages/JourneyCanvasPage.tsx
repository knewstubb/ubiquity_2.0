import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useJourneys } from '../contexts/JourneysContext';
import { autoHeal } from '../utils/journeyGraph';
import { validateJourney, type ValidationError } from '../utils/journeyValidation';
import type { JourneyNode, JourneyEdge } from '../models/journey';
import { JourneyCanvas } from '../components/journey/JourneyCanvas';
import { NodePalette } from '../components/journey/NodePalette';
import { InspectorPanel } from '../components/journey/InspectorPanel';
import { CanvasToolbar } from '../components/journey/CanvasToolbar';
import { ValidationSummary } from '../components/journey/ValidationSummary';
import { ContentModal } from '../components/journey/ContentModal';
import styles from './JourneyCanvasPage.module.css';

/* ------------------------------------------------------------------ */
/*  Undo / Redo snapshot type                                          */
/* ------------------------------------------------------------------ */

interface CanvasSnapshot {
  nodes: JourneyNode[];
  edges: JourneyEdge[];
}

/* ------------------------------------------------------------------ */
/*  Inner component — must be inside ReactFlowProvider                 */
/* ------------------------------------------------------------------ */

function JourneyCanvasInner() {
  const { journeyId } = useParams<{ journeyId: string }>();
  const { journeys, updateJourney, updateNode } = useJourneys();
  const reactFlow = useReactFlow();

  /* Find the journey */
  const journey = useMemo(
    () => journeys.find((j) => j.id === journeyId),
    [journeys, journeyId],
  );

  /* ---- Local UI state ---- */
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [settingsMode, setSettingsMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [contentModal, setContentModal] = useState<{
    nodeId: string;
    nodeLabel: string;
    contentType: 'email' | 'form' | 'survey';
  } | null>(null);

  /* ---- Undo / Redo stacks (useRef to avoid re-renders) ---- */
  const undoStack = useRef<CanvasSnapshot[]>([]);
  const redoStack = useRef<CanvasSnapshot[]>([]);

  /** Push the current journey state onto the undo stack and clear redo. */
  const pushSnapshot = useCallback(() => {
    if (!journey) return;
    undoStack.current.push({
      nodes: structuredClone(journey.nodes),
      edges: structuredClone(journey.edges),
    });
    redoStack.current = [];
  }, [journey]);

  /** Undo: pop from undo stack, push current state to redo, restore. */
  const handleUndo = useCallback(() => {
    if (!journey || undoStack.current.length === 0) return;
    const snapshot = undoStack.current.pop()!;
    redoStack.current.push({
      nodes: structuredClone(journey.nodes),
      edges: structuredClone(journey.edges),
    });
    updateJourney(journey.id, {
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      nodeCount: snapshot.nodes.length,
    });
  }, [journey, updateJourney]);

  /** Redo: pop from redo stack, push current state to undo, restore. */
  const handleRedo = useCallback(() => {
    if (!journey || redoStack.current.length === 0) return;
    const snapshot = redoStack.current.pop()!;
    undoStack.current.push({
      nodes: structuredClone(journey.nodes),
      edges: structuredClone(journey.edges),
    });
    updateJourney(journey.id, {
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      nodeCount: snapshot.nodes.length,
    });
  }, [journey, updateJourney]);

  /* ---- Keyboard shortcuts ---- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* Ignore shortcuts when typing in an input/textarea/select */
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      /* Escape → deselect node and close inspector */
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSettingsMode(false);
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      /* Ctrl/Cmd + Shift + Z → redo */
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleRedo();
        return;
      }

      /* Ctrl/Cmd + Z → undo */
      if (isMod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  /* ---- Toolbar callbacks ---- */

  const handleZoomIn = useCallback(() => {
    reactFlow.zoomIn();
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    reactFlow.zoomOut();
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    reactFlow.fitView({ padding: 0.2 });
  }, [reactFlow]);

  const handleValidate = useCallback(() => {
    if (!journey) return;
    const errors = validateJourney(journey);
    setValidationErrors(errors);
    setShowValidationSummary(true);
  }, [journey]);

  const handleSettings = useCallback(() => {
    setSettingsMode((prev) => !prev);
    setSelectedNodeId(null);
  }, []);

  /* ---- Node selection ---- */

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      setSettingsMode(false);
    }
  }, []);

  /* ---- Inspector callbacks ---- */

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (!journey) return;
      pushSnapshot();
      const result = autoHeal(journey.nodes, journey.edges, nodeId);
      updateJourney(journey.id, {
        nodes: result.nodes,
        edges: result.edges,
        nodeCount: result.nodes.length,
      });
      setSelectedNodeId(null);
      setSettingsMode(false);
    },
    [journey, updateJourney, pushSnapshot],
  );

  const handleInspectorClose = useCallback(() => {
    setSelectedNodeId(null);
    setSettingsMode(false);
  }, []);

  /* ---- Content modal callbacks ---- */

  const handleEditContent = useCallback(
    (contentType: 'email' | 'form' | 'survey') => {
      if (!journey || !selectedNodeId) return;
      const node = journey.nodes.find((n) => n.id === selectedNodeId);
      if (!node) return;
      setContentModal({
        nodeId: selectedNodeId,
        nodeLabel: node.label,
        contentType,
      });
    },
    [journey, selectedNodeId],
  );

  const handleContentModalClose = useCallback(() => {
    setContentModal(null);
  }, []);

  const handleContentModalSave = useCallback(
    (content: string) => {
      if (!journey || !contentModal) return;
      const node = journey.nodes.find((n) => n.id === contentModal.nodeId);
      if (!node) return;

      if (node.config.subType === 'send-email') {
        updateNode(journey.id, contentModal.nodeId, {
          config: { ...node.config, emailContent: content },
        });
      }
      setContentModal(null);
    },
    [journey, contentModal, updateNode],
  );

  /* ---- Validation summary callbacks ---- */

  const handleValidationSelectNode = useCallback(
    (nodeId: string) => {
      if (!journey) return;
      const node = journey.nodes.find((n) => n.id === nodeId);
      if (node) {
        reactFlow.setCenter(node.position.x, node.position.y, {
          zoom: 1,
          duration: 400,
        });
        setSelectedNodeId(nodeId);
      }
    },
    [journey, reactFlow],
  );

  const handleValidationClose = useCallback(() => {
    setShowValidationSummary(false);
  }, []);

  /* ---- Not found state ---- */

  if (!journey) {
    return (
      <div className={styles.notFound}>
        <h2>Journey not found</h2>
        <p>The journey you're looking for doesn't exist or has been removed.</p>
        <Link to="/automations/journeys" className={styles.backLink}>
          ← Back to Journeys
        </Link>
      </div>
    );
  }

  /* ---- Derived state ---- */
  const hasTrigger = journey.nodes.some((n) => n.type === 'trigger');

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <CanvasToolbar
        journeyName={journey.name}
        journeyStatus={journey.status}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onValidate={handleValidate}
        onSettings={handleSettings}
        validationErrors={validationErrors}
      />

      {/* Validation summary dropdown */}
      {showValidationSummary && (
        <div className={styles.validationDropdown}>
          <ValidationSummary
            errors={validationErrors}
            onSelectNode={handleValidationSelectNode}
            onClose={handleValidationClose}
          />
        </div>
      )}

      {/* Main canvas area: palette + canvas + inspector */}
      <div className={styles.canvasRow}>
        <NodePalette hasTrigger={hasTrigger} />

        <div className={styles.canvasCenter}>
          <JourneyCanvas
            journey={journey}
            onNodeSelect={handleNodeSelect}
            validationErrors={validationErrors}
            onBeforeMutation={pushSnapshot}
          />
        </div>

        <InspectorPanel
          journeyId={journey.id}
          selectedNodeId={selectedNodeId}
          settingsMode={settingsMode}
          onClose={handleInspectorClose}
          onDeleteNode={handleDeleteNode}
          onEditContent={handleEditContent}
        />
      </div>

      {/* Content modal overlay */}
      {contentModal && (
        <ContentModal
          contentType={contentModal.contentType}
          nodeLabel={contentModal.nodeLabel}
          onClose={handleContentModalClose}
          onSave={handleContentModalSave}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Outer wrapper — provides ReactFlowProvider                         */
/* ------------------------------------------------------------------ */

export default function JourneyCanvasPage() {
  return (
    <ReactFlowProvider>
      <JourneyCanvasInner />
    </ReactFlowProvider>
  );
}
