import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type DragEvent,
} from 'react';
import {
  ReactFlow,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnNodesDelete,
} from '@xyflow/react';
import { useJourneys } from '../../contexts/JourneysContext';
import { detectCycle, autoConnect, autoHeal } from '../../utils/journeyGraph';
import type { ValidationError } from '../../utils/journeyValidation';
import type {
  JourneyDefinition,
  JourneyNode,
  JourneyEdge,
  NodeType,
} from '../../models/journey';
import { createDefaultConfig } from '../../models/journey';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { WaitNode } from './nodes/WaitNode';
import { BranchNode } from './nodes/BranchNode';
import { EndNode } from './nodes/EndNode';
import { JoinNode } from './nodes/JoinNode';
import styles from './JourneyCanvas.module.css';

/* ------------------------------------------------------------------ */
/*  Custom node type registry                                         */
/* ------------------------------------------------------------------ */

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  wait: WaitNode,
  branch: BranchNode,
  end: EndNode,
  join: JoinNode,
};

/* ------------------------------------------------------------------ */
/*  Conversion helpers: JourneyNode/Edge ↔ React Flow Node/Edge       */
/* ------------------------------------------------------------------ */

function toFlowNodes(
  journeyNodes: JourneyNode[],
  errorNodeIds: Set<string>,
): Node[] {
  return journeyNodes.map((jn) => ({
    id: jn.id,
    type: jn.type,
    position: jn.position,
    data: {
      journeyNode: jn,
      hasError: errorNodeIds.has(jn.id),
    },
  }));
}

function toFlowEdges(journeyEdges: JourneyEdge[]): Edge[] {
  return journeyEdges.map((je) => ({
    id: je.id,
    source: je.sourceNodeId,
    target: je.targetNodeId,
    sourceHandle: je.sourceHandle || undefined,
    label: je.label,
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
  }));
}

function toJourneyNodes(flowNodes: Node[]): JourneyNode[] {
  return flowNodes.map((fn) => ({
    ...(fn.data as { journeyNode: JourneyNode }).journeyNode,
    position: fn.position,
  }));
}

function toJourneyEdges(flowEdges: Edge[]): JourneyEdge[] {
  return flowEdges.map((fe) => ({
    id: fe.id,
    sourceNodeId: fe.source,
    targetNodeId: fe.target,
    sourceHandle: (fe.sourceHandle as string) ?? 'default',
    label: (fe.label as string) ?? undefined,
  }));
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface JourneyCanvasProps {
  journey: JourneyDefinition;
  onNodeSelect: (nodeId: string | null) => void;
  validationErrors?: ValidationError[];
  onBeforeMutation?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function JourneyCanvas({
  journey,
  onNodeSelect,
  validationErrors = [],
  onBeforeMutation,
}: JourneyCanvasProps) {
  const { updateJourney } = useJourneys();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  /* Build a set of node IDs that have validation errors */
  const errorNodeIds = useMemo(
    () => new Set(validationErrors.filter((e) => e.nodeId).map((e) => e.nodeId!)),
    [validationErrors],
  );

  /* Convert journey data → React Flow format */
  const initialNodes = useMemo(
    () => toFlowNodes(journey.nodes, errorNodeIds),
    [journey.nodes, errorNodeIds],
  );
  const initialEdges = useMemo(
    () => toFlowEdges(journey.edges),
    [journey.edges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  /* Keep React Flow state in sync when journey prop changes externally */
  useEffect(() => {
    setNodes(toFlowNodes(journey.nodes, errorNodeIds));
  }, [journey.nodes, errorNodeIds, setNodes]);

  useEffect(() => {
    setEdges(toFlowEdges(journey.edges));
  }, [journey.edges, setEdges]);

  /* ---- Sync canvas changes back to context ---- */

  const syncToContext = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      updateJourney(journey.id, {
        nodes: toJourneyNodes(updatedNodes),
        edges: toJourneyEdges(updatedEdges),
        nodeCount: updatedNodes.length,
      });
    },
    [journey.id, updateJourney],
  );

  /* ---- Connection handler with cycle detection ---- */

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.target) return false;
      return !detectCycle(journey.nodes, journey.edges, {
        sourceNodeId: connection.source,
        targetNodeId: connection.target,
      });
    },
    [journey.nodes, journey.edges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      onBeforeMutation?.();
      const newEdge: JourneyEdge = {
        id: `e-${connection.source}-${connection.target}`,
        sourceNodeId: connection.source,
        targetNodeId: connection.target,
        sourceHandle: (connection.sourceHandle as string) ?? 'default',
      };
      const updatedEdges = [...journey.edges, newEdge];
      updateJourney(journey.id, { edges: updatedEdges });
    },
    [journey.id, journey.edges, updateJourney, onBeforeMutation],
  );

  /* ---- Node deletion with auto-heal ---- */

  const onNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      onBeforeMutation?.();
      let currentNodes = journey.nodes;
      let currentEdges = journey.edges;

      for (const dn of deletedNodes) {
        const result = autoHeal(currentNodes, currentEdges, dn.id);
        currentNodes = result.nodes;
        currentEdges = result.edges;
      }

      updateJourney(journey.id, {
        nodes: currentNodes,
        edges: currentEdges,
        nodeCount: currentNodes.length,
      });
    },
    [journey.id, journey.nodes, journey.edges, updateJourney, onBeforeMutation],
  );

  /* ---- Drop handler for drag-from-palette ---- */

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      const nodeSubType = event.dataTransfer.getData('application/reactflow-subtype');
      const targetEdgeId = event.dataTransfer.getData('application/reactflow-edge');

      if (!nodeType || !nodeSubType) return;

      const wrapperBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!wrapperBounds) return;

      const position = {
        x: event.clientX - wrapperBounds.left,
        y: event.clientY - wrapperBounds.top,
      };

      const newNode: JourneyNode = {
        id: `node-${Date.now()}`,
        type: nodeType,
        subType: nodeSubType,
        position,
        label: nodeSubType
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        config: createDefaultConfig(nodeSubType),
      };

      onBeforeMutation?.();

      if (targetEdgeId) {
        /* Dropped on an edge → auto-connect */
        const result = autoConnect(journey.nodes, journey.edges, newNode, targetEdgeId);
        updateJourney(journey.id, {
          nodes: result.nodes,
          edges: result.edges,
          nodeCount: result.nodes.length,
        });
      } else {
        /* Dropped on empty canvas */
        updateJourney(journey.id, {
          nodes: [...journey.nodes, newNode],
          edges: journey.edges,
          nodeCount: journey.nodes.length + 1,
        });
      }
    },
    [journey, updateJourney, onBeforeMutation],
  );

  /* ---- Node selection ---- */

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  /* ---- Track drag start for undo snapshot ---- */

  const onNodeDragStart = useCallback(() => {
    onBeforeMutation?.();
  }, [onBeforeMutation]);

  /* ---- Sync position changes back to context on drag end ---- */

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node, updatedNodes: Node[]) => {
      syncToContext(updatedNodes, edges);
    },
    [edges, syncToContext],
  );

  /* ---- Empty state ---- */

  const isEmpty = journey.nodes.length === 0;

  return (
    <div className={styles.canvasContainer} ref={reactFlowWrapper}>
      {isEmpty && (
        <div className={styles.emptyState}>
          <h3>No nodes yet</h3>
          <p>Drag a trigger node from the palette to start building your journey.</p>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onDrop={onDrop}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[16, 16]}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <MiniMap position="bottom-right" pannable zoomable />
      </ReactFlow>
    </div>
  );
}
