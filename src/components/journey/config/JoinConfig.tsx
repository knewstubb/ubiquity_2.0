import { useJourneys } from '../../../contexts/JourneysContext';
import type { JourneyNode } from '../../../models/journey';

export interface JoinConfigProps {
  journeyId: string;
  node: JourneyNode;
}

export function JoinConfig({ journeyId, node }: JoinConfigProps) {
  const { journeys } = useJourneys();

  // Find the journey to access its edges
  const journey = journeys.find((j) => j.id === journeyId);

  // Count incoming edges to this join node
  const incomingEdgeCount = journey
    ? journey.edges.filter((e) => e.target === node.id).length
    : 0;

  return (
    <div>
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <span className="text-xs font-semibold text-muted-foreground leading-tight">
          Incoming Paths
        </span>
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-secondary/50">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {incomingEdgeCount}
          </span>
          <span className="text-sm text-muted-foreground">
            {incomingEdgeCount === 1 ? 'path' : 'paths'} converging
          </span>
        </div>
        <span className="text-xs text-muted-foreground leading-tight">
          Connect branch outputs or other nodes to this join node to merge paths.
        </span>
      </div>
    </div>
  );
}
