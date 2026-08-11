import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

/**
 * Simple edge without the (+) insert button.
 * Uses smooth Bezier curves for organic flow.
 * Used for connections between Condition nodes and their BranchLabel nodes.
 */
export function BranchEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />;
}
