import { usePrototypePhases } from '../../contexts/PrototypePhaseContext'
import { cn } from '../../lib/utils'

const PHASES = [1, 2, 3] as const

export function PhaseToggle() {
  const { phases, setExporterPhase } = usePrototypePhases()

  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[10px] font-medium text-tertiary-foreground uppercase tracking-[0.04em]">Phase</span>
      <div className="flex items-center border border-border rounded-md overflow-hidden">
        {PHASES.map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => setExporterPhase(phase)}
            className={cn(
              'px-2 py-0.5 text-xs font-bold border-none cursor-pointer transition-colors duration-150',
              phases.exporterPhase === phase
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {phase}
          </button>
        ))}
      </div>
    </div>
  )
}
