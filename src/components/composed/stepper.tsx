import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface StepperStep {
  label: string
  description?: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  completedSteps?: number[]
  orientation?: 'vertical' | 'horizontal'
  onStepClick?: (stepIndex: number) => void
  className?: string
}

export function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  orientation = 'vertical',
  onStepClick,
  className,
}: StepperProps) {
  const isCompleted = (index: number) => completedSteps.includes(index)
  const isCurrent = (index: number) => index === currentStep
  const isClickable = (index: number) => isCompleted(index) && !isCurrent(index) && !!onStepClick
  const isLast = (index: number) => index === steps.length - 1

  if (orientation === 'horizontal') {
    return (
      <nav
        className={cn('grid', className)}
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        aria-label="Progress"
      >
        {steps.map((step, index) => {
          const completed = isCompleted(index)
          const current = isCurrent(index)
          const clickable = isClickable(index)

          const handleClick = () => { if (clickable) onStepClick?.(index) }
          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onStepClick?.(index) }
          }

          return (
            <div key={index} className="flex flex-col items-center gap-2.5">
              {/* Indicator row with connectors */}
              <div className="flex items-center w-full">
                {/* Left half connector */}
                {index > 0 ? (
                  <div className="flex-1 flex items-center">
                    <div
                      className={cn(
                        'w-full h-0.5 rounded-full',
                        isCompleted(index - 1) ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
                      )}
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div className="flex-1" />
                )}

                {/* Indicator box */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-[6px] flex items-center justify-center text-sm font-semibold shrink-0 mx-1 transition-all duration-200',
                    'border-2 border-zinc-300 dark:border-zinc-600 text-tertiary-foreground',
                    current && 'border-primary bg-primary text-primary-foreground',
                    completed && !current && 'border-primary text-primary',
                    clickable && 'cursor-pointer hover:bg-primary/5'
                  )}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-current={current ? 'step' : undefined}
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                >
                  {completed && !current ? <Check size={14} weight="bold" /> : index + 1}
                </div>

                {/* Right half connector */}
                {!isLast(index) ? (
                  <div className="flex-1 flex items-center">
                    <div
                      className={cn(
                        'w-full h-0.5 rounded-full',
                        completed ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
                      )}
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div className="flex-1" />
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col items-center text-center px-3">
                <span
                  className={cn(
                    'text-sm font-semibold text-tertiary-foreground transition-colors duration-150',
                    current && 'text-primary font-bold',
                    completed && !current && 'text-muted-foreground',
                    clickable && 'cursor-pointer hover:text-primary'
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-tertiary-foreground mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </nav>
    )
  }

  // Vertical orientation
  return (
    <nav className={cn('flex flex-col', className)} aria-label="Progress">
      {steps.map((step, index) => {
        const completed = isCompleted(index)
        const current = isCurrent(index)
        const clickable = isClickable(index)

        const handleClick = () => { if (clickable) onStepClick?.(index) }
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onStepClick?.(index) }
        }

        return (
          <div key={index} className="flex gap-2.5">
            {/* Left column: indicator + connector below */}
            <div className="flex flex-col items-center w-8 shrink-0">
              {/* Indicator */}
              <div
                className={cn(
                  'w-8 h-8 rounded-[6px] flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-200',
                  'border-2 border-zinc-300 dark:border-zinc-600 text-tertiary-foreground',
                  current && 'border-primary bg-primary text-primary-foreground',
                  completed && !current && 'border-primary text-primary',
                  clickable && 'cursor-pointer hover:bg-primary/5'
                )}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-current={current ? 'step' : undefined}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
              >
                {completed && !current ? <Check size={14} weight="bold" /> : index + 1}
              </div>
              {/* Connector below (stretches to fill remaining height) */}
              {!isLast(index) && (
                <div
                  className={cn(
                    'w-0.5 flex-1 my-1 min-h-4 rounded-full',
                    completed ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Right column: label (top-aligned to indicator, centred for single line) */}
            <div className="flex flex-col justify-start pt-1.5 min-h-8 pb-2">
              <span
                className={cn(
                  'text-sm font-semibold text-tertiary-foreground leading-tight transition-colors duration-150',
                  current && 'text-primary font-bold',
                  completed && !current && 'text-muted-foreground',
                  clickable && 'hover:text-primary'
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-xs text-tertiary-foreground mt-0.5">
                  {step.description}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
