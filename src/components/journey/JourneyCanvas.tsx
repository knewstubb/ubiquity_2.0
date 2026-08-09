import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
  Position,
} from '@xyflow/react';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import '@xyflow/react/dist/style.css';
import {
  X,
  Trash,
  Envelope,
  ChatCircle,
  UserGear,
  Globe,
  Clock,
  Hourglass,
  CalendarCheck,
  GitBranch,
  Percent,
  Play,
  Flag,
} from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { InsertableEdge, type InsertableEdgeData } from './edges/InsertableEdge';
import { BranchEdge } from './edges/BranchEdge';
import { NodeTypePicker } from './NodeTypePicker';
import { ConditionNode } from './nodes/ConditionNode';
import { BranchLabelNode } from './nodes/BranchLabelNode';
import { JourneyNodeCardWrapper, type JourneyNodeCardData } from './nodes/JourneyNodeCard';
import { FIXED_START_ID, FIXED_END_ID, createDefaultConfig } from '../../models/journey';
import type { NodeType, JourneyNode as JourneyNodeModel, JourneyEdge, BranchLabelConfig, IfElseConfig, FilterGroup } from '../../models/journey';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/*  Node type to icon/color mapping                                    */
/* ------------------------------------------------------------------ */

interface NodeTypeConfig {
  icon: PhosphorIcon;
  iconColor: string;
  title: string;
}

const nodeTypeConfigs: Record<string, NodeTypeConfig> = {
  // Actions
  'send-email': { icon: Envelope, iconColor: 'text-primary', title: 'Send Email' },
  'send-sms': { icon: ChatCircle, iconColor: 'text-violet-500', title: 'Send SMS' },
  'update-contact': { icon: UserGear, iconColor: 'text-primary', title: 'Update Contact' },
  'webhook': { icon: Globe, iconColor: 'text-primary', title: 'Webhook' },
  // Waits
  'time-delay': { icon: Clock, iconColor: 'text-blue-500', title: 'Time Delay' },
  'wait-for-event': { icon: Hourglass, iconColor: 'text-blue-500', title: 'Wait for Event' },
  'wait-until-date': { icon: CalendarCheck, iconColor: 'text-blue-500', title: 'Wait Until Date' },
  // Branches (non-conditional)
  'if-else': { icon: GitBranch, iconColor: 'text-purple-500', title: 'If/Else' },
  'ab-split': { icon: Percent, iconColor: 'text-purple-500', title: 'A/B Split' },
  'multi-way': { icon: GitBranch, iconColor: 'text-purple-500', title: 'Multi-way' },
  // Fixed nodes
  'start': { icon: Play, iconColor: 'text-primary', title: 'Start' },
  'end': { icon: Flag, iconColor: 'text-red-500', title: 'End' },
};

/**
 * Create a default node config based on node type and subtype.
 */
function createDefaultNodeConfig(nodeType: NodeType, subType: string): JourneyNodeModel['config'] {
  // Use the model's createDefaultConfig for known subtypes
  const config = createDefaultConfig(subType as Parameters<typeof createDefaultConfig>[0]);
  return config;
}

/* ------------------------------------------------------------------ */
/*  Custom node type registry                                          */
/* ------------------------------------------------------------------ */

const nodeTypes: NodeTypes = {
  condition: ConditionNode,
  'branch-label': BranchLabelNode,
  'journey-card': JourneyNodeCardWrapper,
};

/* ------------------------------------------------------------------ */
/*  Custom edge type registry                                          */
/* ------------------------------------------------------------------ */

const edgeTypes: EdgeTypes = {
  insertable: InsertableEdge,
  branch: BranchEdge,
};

/* ------------------------------------------------------------------ */
/*  Context Menu                                                       */
/* ------------------------------------------------------------------ */

interface ContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  canDelete: boolean;
  onDelete: () => void;
  onClose: () => void;
}

function ContextMenu({ nodeId, x, y, canDelete, onDelete, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] bg-white border border-border rounded-lg shadow-lg font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y }}
    >
      <div className="py-1">
        {canDelete ? (
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash size={16} />
            Delete
          </button>
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground italic">
            Cannot delete {nodeId === FIXED_START_ID ? 'Start' : 'End'} node
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface JourneyCanvasProps {
  journey?: unknown;
  journeyId?: string;
  onNodeSelect?: (nodeId: string | null, node?: JourneyNodeModel | null) => void;
  validationErrors?: unknown[];
  onBeforeMutation?: () => void;
  onNodeAdded?: (node: JourneyNodeModel) => void;
  /** Callback to sync canvas state back to the context */
  onCanvasChange?: (nodes: JourneyNodeModel[], edges: JourneyEdge[]) => void;
  /** Callback to expose undo/redo state and actions to parent */
  onUndoRedoChange?: (state: {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
  }) => void;
}

/** Snapshot type for undo/redo history */
interface CanvasSnapshot {
  nodes: Node[];
  edges: Edge<InsertableEdgeData>[];
}

export function JourneyCanvas(_props: JourneyCanvasProps) {
  /* State for the node type picker */
  const [pickerState, setPickerState] = useState<{
    edgeId: string;
    x: number;
    y: number;
  } | null>(null);

  /* State for selected node (inspector panel) */
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  /* State for context menu */
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);

  /* Insert button click handler */
  const handleInsertClick = useCallback((edgeId: string, x: number, y: number) => {
    setPickerState({ edgeId, x, y });
  }, []);

  /* Initial data - nodes centered at x=120 (so node center is at 240) */
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: FIXED_START_ID,
      type: 'journey-card',
      position: { x: 120, y: 50 },
      data: {
        title: 'Start',
        icon: Play,
        iconColor: 'text-primary',
        description: 'Journey entry point',
        showTargetHandle: false,
        sourceHandles: [{ id: 'default', position: Position.Bottom }],
        nodeType: 'start',
        subType: 'start',
        journeyNode: {
          id: FIXED_START_ID,
          type: 'start',
          subType: 'start',
          position: { x: 120, y: 50 },
          label: 'Start',
          config: { subType: 'start' },
        } as JourneyNodeModel,
      } as JourneyNodeCardData,
    },
    {
      id: FIXED_END_ID,
      type: 'journey-card',
      position: { x: 120, y: 350 },
      data: {
        title: 'End',
        icon: Flag,
        iconColor: 'text-red-500',
        description: 'Journey complete',
        showTargetHandle: true,
        sourceHandles: [],
        nodeType: 'end',
        subType: 'exit',
        journeyNode: {
          id: FIXED_END_ID,
          type: 'end',
          subType: 'exit',
          position: { x: 120, y: 350 },
          label: 'End',
          config: { subType: 'exit', label: '', reason: '' },
        } as JourneyNodeModel,
      } as JourneyNodeCardData,
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<InsertableEdgeData>>([
    {
      id: `e-${FIXED_START_ID}-${FIXED_END_ID}`,
      source: FIXED_START_ID,
      target: FIXED_END_ID,
      type: 'insertable',
      data: {
        onInsertClick: handleInsertClick,
        isPickerOpen: false,
      },
    },
  ]);

  /* ------------------------------------------------------------------ */
  /*  Undo/Redo History                                                  */
  /* ------------------------------------------------------------------ */

  // Initial snapshot for undo/redo (edges data doesn't include callback - added on apply)
  const initialSnapshot = useMemo<CanvasSnapshot>(() => ({
    nodes: [
      {
        id: FIXED_START_ID,
        type: 'journey-card',
        position: { x: 120, y: 50 },
        data: {
          title: 'Start',
          icon: Play,
          iconColor: 'text-primary',
          description: 'Journey entry point',
          showTargetHandle: false,
          sourceHandles: [{ id: 'default', position: Position.Bottom }],
          nodeType: 'start',
          subType: 'start',
          journeyNode: {
            id: FIXED_START_ID,
            type: 'start',
            subType: 'start',
            position: { x: 120, y: 50 },
            label: 'Start',
            config: { subType: 'start' },
          } as JourneyNodeModel,
        } as JourneyNodeCardData,
      },
      {
        id: FIXED_END_ID,
        type: 'journey-card',
        position: { x: 120, y: 350 },
        data: {
          title: 'End',
          icon: Flag,
          iconColor: 'text-red-500',
          description: 'Journey complete',
          showTargetHandle: true,
          sourceHandles: [],
          nodeType: 'end',
          subType: 'exit',
          journeyNode: {
            id: FIXED_END_ID,
            type: 'end',
            subType: 'exit',
            position: { x: 120, y: 350 },
            label: 'End',
            config: { subType: 'exit', label: '', reason: '' },
          } as JourneyNodeModel,
        } as JourneyNodeCardData,
      },
    ],
    edges: [
      {
        id: `e-${FIXED_START_ID}-${FIXED_END_ID}`,
        source: FIXED_START_ID,
        target: FIXED_END_ID,
        type: 'insertable',
        data: {
          isPickerOpen: false,
        },
      },
    ],
  }), []); // No dependencies - static initial state

  const [historyState, historyActions] = useUndoRedo<CanvasSnapshot>(initialSnapshot, { maxHistory: 50 });

  // Track if we're currently applying an undo/redo to avoid re-recording
  const isApplyingHistoryRef = useRef(false);

  // Save current state to history before a mutation
  const saveSnapshotBeforeMutation = useCallback(() => {
    if (isApplyingHistoryRef.current) return;
    
    // Strip out the callback from edges before saving (it's added back on apply)
    const cleanEdges = edges.map(e => ({
      ...e,
      data: { ...e.data, onInsertClick: undefined },
    }));
    historyActions.set({ nodes: [...nodes], edges: cleanEdges });
  }, [nodes, edges, historyActions]);

  // Apply undo
  const handleUndo = useCallback(() => {
    if (!historyState.canUndo) return;
    isApplyingHistoryRef.current = true;
    historyActions.undo();
  }, [historyState.canUndo, historyActions]);

  // Apply redo
  const handleRedo = useCallback(() => {
    if (!historyState.canRedo) return;
    isApplyingHistoryRef.current = true;
    historyActions.redo();
  }, [historyState.canRedo, historyActions]);

  // Stable refs for undo/redo handlers (to avoid triggering parent re-renders)
  const undoRef = useRef(handleUndo);
  const redoRef = useRef(handleRedo);
  undoRef.current = handleUndo;
  redoRef.current = handleRedo;

  // Stable wrapper functions that don't change identity
  const stableUndo = useCallback(() => undoRef.current(), []);
  const stableRedo = useCallback(() => redoRef.current(), []);

  // Track previous history state to detect undo/redo
  const prevHistoryRef = useRef(historyState.current);

  // When history state changes (after undo/redo), apply it to the canvas
  useEffect(() => {
    // Only apply if we're in the middle of an undo/redo operation
    if (!isApplyingHistoryRef.current) return;
    
    // Apply the snapshot to the canvas
    setNodes(historyState.current.nodes);
    setEdges(historyState.current.edges.map(edge => ({
      ...edge,
      data: {
        ...edge.data,
        onInsertClick: handleInsertClick,
      },
    })));
    
    // Reset flag after applying
    isApplyingHistoryRef.current = false;
  }, [historyState.current, setNodes, setEdges, handleInsertClick]);

  // Expose undo/redo state to parent - only when canUndo/canRedo actually changes
  const prevCanUndoRef = useRef(historyState.canUndo);
  const prevCanRedoRef = useRef(historyState.canRedo);

  useEffect(() => {
    // Only call parent if values actually changed
    if (
      prevCanUndoRef.current === historyState.canUndo &&
      prevCanRedoRef.current === historyState.canRedo
    ) {
      return;
    }
    prevCanUndoRef.current = historyState.canUndo;
    prevCanRedoRef.current = historyState.canRedo;

    _props.onUndoRedoChange?.({
      canUndo: historyState.canUndo,
      canRedo: historyState.canRedo,
      undo: stableUndo,
      redo: stableRedo,
    });
  }, [historyState.canUndo, historyState.canRedo, stableUndo, stableRedo, _props.onUndoRedoChange]);

  /* ------------------------------------------------------------------ */
  /*  Sync canvas state back to context                                  */
  /* ------------------------------------------------------------------ */

  // Track previous sync to avoid duplicate updates
  const lastSyncRef = useRef<string>('');
  
  // Debounce timer for canvas sync
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract journey nodes from React Flow nodes and sync to context
  // NOTE: This only syncs structural changes (node additions/removals, edges, positions).
  // Config changes are handled by the inspector panel directly via updateNode.
  useEffect(() => {
    if (!_props.onCanvasChange) return;

    // Clear any pending sync
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    // Debounce the sync to avoid excessive updates during drag operations
    syncTimerRef.current = setTimeout(() => {
      // Extract JourneyNode data from React Flow nodes
      const journeyNodes: JourneyNodeModel[] = nodes
        .map((n) => {
          const data = n.data as JourneyNodeCardData | undefined;
          if (data?.journeyNode) {
            // Update position from React Flow node
            return {
              ...data.journeyNode,
              position: { x: n.position.x, y: n.position.y },
            };
          }
          return null;
        })
        .filter((n): n is JourneyNodeModel => n !== null);

      // Extract journey edges from React Flow edges
      const journeyEdges: JourneyEdge[] = edges.map((e) => ({
        id: e.id,
        sourceNodeId: e.source,
        targetNodeId: e.target,
        sourceHandle: e.sourceHandle ?? 'default',
      }));

      // Create a signature based on structural changes only (not config)
      // Config changes are handled separately by the inspector via updateNode
      const signature = JSON.stringify({ 
        nodeIds: journeyNodes.map(n => n.id).sort(),
        edgeIds: journeyEdges.map(e => e.id).sort(),
        positions: journeyNodes.map(n => ({ id: n.id, x: Math.round(n.position.x), y: Math.round(n.position.y) })).sort((a, b) => a.id.localeCompare(b.id)),
      });

      // Only sync if there are structural changes
      if (signature !== lastSyncRef.current) {
        lastSyncRef.current = signature;
        _props.onCanvasChange(journeyNodes, journeyEdges);
      }
    }, 100); // 100ms debounce

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [nodes, edges, _props.onCanvasChange]);

  /* ------------------------------------------------------------------ */

  /* Get selected node */
  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null;

  /* Update edges when picker state changes to show active state on (+) button */
  const edgesWithPickerState = edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      onInsertClick: handleInsertClick,
      isPickerOpen: pickerState?.edgeId === edge.id,
    },
  }));

  /* Handle node click - select for inspector */
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setPickerState(null);
    setContextMenu(null);
    const journeyNode = (node.data as JourneyNodeCardData)?.journeyNode ?? null;
    _props.onNodeSelect?.(node.id, journeyNode);
  }, [_props]);

  /* Track the drag start position for group movement */
  const dragStartPositionRef = useRef<{ nodeId: string; x: number; y: number } | null>(null);

  /* Track space bar state for pan mode */
  const [isPanMode, setIsPanMode] = useState(false);

  /* Keyboard shortcuts - space bar pan mode + undo/redo */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar for pan mode
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsPanMode(true);
        return;
      }

      // Undo: Cmd/Ctrl + Z (without Shift)
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUndo, handleRedo]);

  /* Handle node drag start - DO NOT select (Miro-style: drag doesn't select) */
  const onNodeDragStart = useCallback((_event: React.MouseEvent, node: Node) => {
    setPickerState(null);
    setContextMenu(null);
    
    // Track starting position for condition nodes (for group movement)
    if (node.type === 'condition') {
      dragStartPositionRef.current = {
        nodeId: node.id,
        x: node.position.x,
        y: node.position.y,
      };
    }
  }, []);

  /* Handle node drag - move branch labels with their parent condition node */
  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Only apply group movement for condition nodes
      if (node.type !== 'condition') return;
      if (!dragStartPositionRef.current || dragStartPositionRef.current.nodeId !== node.id) return;

      // Find the branch labels that belong to this condition
      const branchLabelIds = edges
        .filter((e) => e.source === node.id && e.type === 'branch')
        .map((e) => e.target);

      if (branchLabelIds.length === 0) return;

      // Calculate delta from drag start
      const deltaX = node.position.x - dragStartPositionRef.current.x;
      const deltaY = node.position.y - dragStartPositionRef.current.y;

      // Update the start position for next frame
      dragStartPositionRef.current = {
        nodeId: node.id,
        x: node.position.x,
        y: node.position.y,
      };

      // If no movement, skip
      if (deltaX === 0 && deltaY === 0) return;

      // Update branch label positions
      setNodes((nds) =>
        nds.map((n) => {
          if (branchLabelIds.includes(n.id)) {
            return {
              ...n,
              position: {
                x: n.position.x + deltaX,
                y: n.position.y + deltaY,
              },
            };
          }
          return n;
        })
      );
    },
    [edges, setNodes]
  );
  
  /* Clear drag tracking on drag stop */
  const onNodeDragStop = useCallback(() => {
    dragStartPositionRef.current = null;
  }, []);

  /* Handle node right-click - show context menu */
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      nodeId: node.id,
      x: event.clientX,
      y: event.clientY,
    });
    setSelectedNodeId(node.id);
    setPickerState(null);
    const journeyNode = (node.data as JourneyNodeCardData)?.journeyNode ?? null;
    _props.onNodeSelect?.(node.id, journeyNode);
  }, [_props]);

  /* Handle node update from inspector */
  const handleNodeUpdate = useCallback((nodeId: string, data: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      )
    );
  }, [setNodes]);

  /* Handle node delete from inspector */
  const handleNodeDelete = useCallback((nodeId: string) => {
    // Don't allow deleting Start or End
    if (nodeId === FIXED_START_ID || nodeId === FIXED_END_ID) return;

    // Save state before mutation for undo
    saveSnapshotBeforeMutation();

    const nodeToDelete = nodes.find((n) => n.id === nodeId);
    if (!nodeToDelete) return;

    // Check if this is a condition node (has branch-label children)
    const isConditionNode = nodeToDelete.type === 'condition';
    
    // Check if this is a branch-label node
    const isBranchLabel = nodeToDelete.type === 'branch-label';

    if (isConditionNode) {
      // Find all branch labels connected to this condition
      const branchLabelIds = edges
        .filter((e) => e.source === nodeId)
        .map((e) => e.target);
      
      // Find what's upstream of the condition
      const upstreamEdge = edges.find((e) => e.target === nodeId);
      
      // Find what's downstream of ALL branch labels (they should converge to same target)
      const downstreamTargets = new Set<string>();
      for (const labelId of branchLabelIds) {
        const labelOutgoing = edges.filter((e) => e.source === labelId);
        for (const edge of labelOutgoing) {
          downstreamTargets.add(edge.target);
        }
      }
      
      // All nodes to remove: condition + branch labels
      const nodesToRemove = new Set([nodeId, ...branchLabelIds]);
      
      // Remove all affected nodes
      setNodes((nds) => nds.filter((n) => !nodesToRemove.has(n.id)));
      
      // Remove all affected edges and create heal edge
      setEdges((eds) => {
        const cleanedEdges = eds.filter(
          (e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)
        );
        
        // Reconnect upstream to first downstream target
        if (upstreamEdge && downstreamTargets.size > 0) {
          const targetId = [...downstreamTargets][0];
          const healEdge: Edge<InsertableEdgeData> = {
            id: `edge-${upstreamEdge.source}-${targetId}`,
            source: upstreamEdge.source,
            target: targetId,
            type: 'insertable',
            data: { onInsertClick: handleInsertClick },
          };
          return [...cleanedEdges, healEdge];
        }
        
        return cleanedEdges;
      });
      
      setSelectedNodeId(null);
      return;
    }

    if (isBranchLabel) {
      // Find the parent condition node from the branch label's data
      const branchLabelData = nodeToDelete.data as { journeyNode?: JourneyNodeModel };
      const parentConditionId = (branchLabelData.journeyNode?.config as BranchLabelConfig)?.parentBranchNodeId;
      
      if (parentConditionId) {
        // Delete the entire conditional split by deleting the parent condition
        // This will recursively clean up via the condition deletion logic above
        // Find all branch labels for this condition
        const siblingLabelIds = edges
          .filter((e) => e.source === parentConditionId)
          .map((e) => e.target);
        
        // Find what's upstream of the condition
        const upstreamEdge = edges.find((e) => e.target === parentConditionId);
        
        // Find what's downstream of ALL branch labels
        const downstreamTargets = new Set<string>();
        for (const labelId of siblingLabelIds) {
          const labelOutgoing = edges.filter((e) => e.source === labelId);
          for (const edge of labelOutgoing) {
            downstreamTargets.add(edge.target);
          }
        }
        
        // All nodes to remove: condition + all branch labels
        const nodesToRemove = new Set([parentConditionId, ...siblingLabelIds]);
        
        // Remove all affected nodes
        setNodes((nds) => nds.filter((n) => !nodesToRemove.has(n.id)));
        
        // Remove all affected edges and create heal edge
        setEdges((eds) => {
          const cleanedEdges = eds.filter(
            (e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)
          );
          
          // Reconnect upstream to first downstream target
          if (upstreamEdge && downstreamTargets.size > 0) {
            const targetId = [...downstreamTargets][0];
            const healEdge: Edge<InsertableEdgeData> = {
              id: `edge-${upstreamEdge.source}-${targetId}`,
              source: upstreamEdge.source,
              target: targetId,
              type: 'insertable',
              data: { onInsertClick: handleInsertClick },
            };
            return [...cleanedEdges, healEdge];
          }
          
          return cleanedEdges;
        });
        
        setSelectedNodeId(null);
        return;
      }
    }

    // Standard node deletion with auto-heal
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    const outgoingEdges = edges.filter((e) => e.source === nodeId);

    // Simple case: one incoming, one outgoing — reconnect
    if (incomingEdges.length === 1 && outgoingEdges.length === 1) {
      const newEdge: Edge<InsertableEdgeData> = {
        id: `edge-${incomingEdges[0].source}-${outgoingEdges[0].target}`,
        source: incomingEdges[0].source,
        target: outgoingEdges[0].target,
        type: 'insertable',
        data: { onInsertClick: handleInsertClick },
      };
      setEdges((eds) => [
        ...eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
        newEdge,
      ]);
    } else {
      // Multiple connections — just remove edges, can't auto-heal
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    }

    // Remove the node
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setSelectedNodeId(null);
  }, [edges, nodes, setEdges, setNodes, handleInsertClick, saveSnapshotBeforeMutation]);

  /* Handle inspector close */
  const handleInspectorClose = useCallback(() => {
    setSelectedNodeId(null);
    _props.onNodeSelect?.(null);
  }, [_props]);

  /* Handle node type selection from picker */
  const handleNodeTypeSelect = useCallback(
    (nodeType: NodeType, subType: string) => {
      if (!pickerState) return;

      // Save state before mutation for undo
      saveSnapshotBeforeMutation();

      const { edgeId } = pickerState;
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      // Find source and target nodes to position the new node between them
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      // Handle conditional split specially - creates condition node + branch label nodes
      if (subType === 'conditional-split') {
        const timestamp = Date.now();
        const conditionNodeId = `condition-${timestamp}`;
        const trueLabelId = `branch-true-${timestamp}`;
        const falseLabelId = `branch-false-${timestamp}`;

        // Layout constants
        const NODE_WIDTH = 240; // Width of JourneyNodeCard / ConditionNode
        const CONDITION_HEIGHT = 100; // Height of condition node
        const BRANCH_LABEL_WIDTH = 80; // Approximate width of True/False label
        const BRANCH_LABEL_HEIGHT = 40; // Height of branch label
        const VERTICAL_GAP = 60; // Gap between unrelated rows
        const LABEL_GAP = 24; // Small gap between condition and its branch labels
        const BRANCH_HORIZONTAL_GAP = 40; // Gap between True and False labels

        // Calculate center X (align with source node center)
        const centerX = sourceNode.position.x + (NODE_WIDTH / 2);
        
        // Position condition node below source with gap
        const conditionY = sourceNode.position.y + 120 + VERTICAL_GAP;
        
        // Position branch labels close to condition node (small gap)
        const labelY = conditionY + CONDITION_HEIGHT + LABEL_GAP;
        const totalLabelsWidth = (BRANCH_LABEL_WIDTH * 2) + BRANCH_HORIZONTAL_GAP;
        const labelsStartX = centerX - (totalLabelsWidth / 2);
        
        // Position target node below branch labels with larger gap
        const targetY = labelY + BRANCH_LABEL_HEIGHT + VERTICAL_GAP;

        // Create the condition node (decision point) - centered
        const conditionNode: Node = {
          id: conditionNodeId,
          type: 'condition',
          position: { x: centerX - (NODE_WIDTH / 2), y: conditionY },
          data: {
            label: 'Condition',
            journeyNode: {
              id: conditionNodeId,
              type: 'branch',
              subType: 'if-else',
              position: { x: centerX - (NODE_WIDTH / 2), y: conditionY },
              label: 'Condition',
              config: {
                subType: 'if-else',
                condition: { combinator: 'AND', rules: [], groups: [] } as FilterGroup,
              } as IfElseConfig,
            } as JourneyNodeModel,
          },
        };

        // Create the True branch label node - left side
        const trueLabelNode: Node = {
          id: trueLabelId,
          type: 'branch-label',
          position: { x: labelsStartX, y: labelY },
          data: {
            label: 'True',
            journeyNode: {
              id: trueLabelId,
              type: 'branch-label',
              subType: 'branch-label',
              position: { x: labelsStartX, y: labelY },
              label: 'True',
              config: {
                subType: 'branch-label',
                branchId: 'true',
                parentBranchNodeId: conditionNodeId,
              } as BranchLabelConfig,
            } as JourneyNodeModel,
          },
        };

        // Create the False branch label node - right side
        const falseLabelNode: Node = {
          id: falseLabelId,
          type: 'branch-label',
          position: { x: labelsStartX + BRANCH_LABEL_WIDTH + BRANCH_HORIZONTAL_GAP, y: labelY },
          data: {
            label: 'False',
            journeyNode: {
              id: falseLabelId,
              type: 'branch-label',
              subType: 'branch-label',
              position: { x: labelsStartX + BRANCH_LABEL_WIDTH + BRANCH_HORIZONTAL_GAP, y: labelY },
              label: 'False',
              config: {
                subType: 'branch-label',
                branchId: 'false',
                parentBranchNodeId: conditionNodeId,
              } as BranchLabelConfig,
            } as JourneyNodeModel,
          },
        };

        // Move target node down and center it
        const updatedNodes = nodes.map((n) => {
          if (n.id === edge.target) {
            return { 
              ...n, 
              position: { 
                x: centerX - (NODE_WIDTH / 2), 
                y: targetY,
              } 
            };
          }
          return n;
        });

        // Create edges for the split structure
        const newEdges: Edge<InsertableEdgeData>[] = [
          // Source → Condition (insertable)
          {
            id: `edge-${edge.source}-${conditionNodeId}`,
            source: edge.source,
            target: conditionNodeId,
            type: 'insertable',
            data: { onInsertClick: handleInsertClick },
          },
          // Condition → True Label (no insert button - branch edge)
          {
            id: `edge-${conditionNodeId}-${trueLabelId}`,
            source: conditionNodeId,
            sourceHandle: 'true',
            target: trueLabelId,
            type: 'branch',
          },
          // Condition → False Label (no insert button - branch edge)
          {
            id: `edge-${conditionNodeId}-${falseLabelId}`,
            source: conditionNodeId,
            sourceHandle: 'false',
            target: falseLabelId,
            type: 'branch',
          },
          // True Label → Target (insertable - add steps here)
          {
            id: `edge-${trueLabelId}-${edge.target}`,
            source: trueLabelId,
            target: edge.target,
            type: 'insertable',
            data: { onInsertClick: handleInsertClick },
          },
          // False Label → Target (insertable - add steps here)
          {
            id: `edge-${falseLabelId}-${edge.target}`,
            source: falseLabelId,
            target: edge.target,
            type: 'insertable',
            data: { onInsertClick: handleInsertClick },
          },
        ];

        // Update state
        setNodes([...updatedNodes, conditionNode, trueLabelNode, falseLabelNode]);
        setEdges((eds) => [...eds.filter((e) => e.id !== edgeId), ...newEdges]);
        setPickerState(null);
        return;
      }

      // Standard node insertion (non-conditional-split)
      const newNodeId = `node-${Date.now()}`;
      
      // Get node config for icon and color
      const config = nodeTypeConfigs[subType] || {
        icon: Play,
        iconColor: 'text-primary',
        title: subType.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      };

      // Create the journey node data for the inspector
      const journeyNode: JourneyNodeModel = {
        id: newNodeId,
        type: nodeType,
        subType: subType,
        position: {
          x: (sourceNode.position.x + targetNode.position.x) / 2,
          y: (sourceNode.position.y + targetNode.position.y) / 2,
        },
        label: config.title,
        config: createDefaultNodeConfig(nodeType, subType),
      };
      
      const newNode: Node = {
        id: newNodeId,
        type: 'journey-card',
        position: journeyNode.position,
        data: {
          title: config.title,
          icon: config.icon,
          iconColor: config.iconColor,
          description: 'Configure...',
          isIncomplete: true,
          showTargetHandle: true,
          sourceHandles: [{ id: 'default', position: Position.Bottom }],
          nodeType: nodeType,
          subType: subType,
          journeyNode: journeyNode,
        } as JourneyNodeCardData,
      };

      // Create new edges: source → newNode → target
      const newEdge1: Edge<InsertableEdgeData> = {
        id: `edge-${edge.source}-${newNodeId}`,
        source: edge.source,
        target: newNodeId,
        type: 'insertable',
        data: { onInsertClick: handleInsertClick },
      };

      const newEdge2: Edge<InsertableEdgeData> = {
        id: `edge-${newNodeId}-${edge.target}`,
        source: newNodeId,
        target: edge.target,
        type: 'insertable',
        data: { onInsertClick: handleInsertClick },
      };

      // Update state: add new node, remove old edge, add two new edges
      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds.filter((e) => e.id !== edgeId), newEdge1, newEdge2]);

      // Close picker
      setPickerState(null);
    },
    [pickerState, edges, nodes, setNodes, setEdges, handleInsertClick, saveSnapshotBeforeMutation],
  );

  const handlePickerClose = useCallback(() => {
    setPickerState(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setPickerState(null);
    setContextMenu(null);
    _props.onNodeSelect?.(null, null);
  }, [_props]);

  return (
    <div className="w-full h-full relative">
      <div className={cn(
        'w-full h-full transition-all duration-200',
        selectedNode && 'pr-80',
        isPanMode && '[&_.react-flow__pane]:!cursor-grab [&_.react-flow__pane:active]:!cursor-grabbing'
      )}>
        <ReactFlow
          nodes={nodes}
          edges={edgesWithPickerState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          panOnDrag={isPanMode}
          selectionOnDrag={!isPanMode}
          fitView
        >
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="!bg-secondary !border-border"
            maskColor="rgba(0, 0, 0, 0.1)"
            position="bottom-left"
          />
        </ReactFlow>
      </div>

      {/* Node type picker popover */}
      {pickerState && (
        <NodeTypePicker
          x={pickerState.x}
          y={pickerState.y}
          onSelect={handleNodeTypeSelect}
          onClose={handlePickerClose}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          canDelete={contextMenu.nodeId !== FIXED_START_ID && contextMenu.nodeId !== FIXED_END_ID}
          onDelete={() => handleNodeDelete(contextMenu.nodeId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
