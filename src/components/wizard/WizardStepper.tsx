import { cn } from '../../lib/utils';

interface WizardStepperProps {
  steps: { label: string }[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepIndex: number) => void;
}

export function WizardStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardStepperProps) {
  const isCompleted = (index: number) => completedSteps.includes(index);
  const isCurrent = (index: number) => index === currentStep;
  const isClickable = (index: number) => isCompleted(index) && !isCurrent(index);
  const isLast = (index: number) => index === steps.length - 1;

  return (
    <nav className="flex flex-col gap-0 py-4" aria-label="Wizard progress">
      {steps.map((step, index) => {
        const completed = isCompleted(index);
        const current = isCurrent(index);
        const clickable = isClickable(index);

        const handleClick = () => {
          if (clickable) {
            onStepClick(index);
          }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onStepClick(index);
          }
        };

        return (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 relative p-0 cursor-default",
              clickable && "cursor-pointer group"
            )}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-current={current ? 'step' : undefined}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            <div className="flex flex-col items-center shrink-0 w-9">
              <div
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-200",
                  "border-2 border-border-strong bg-background text-tertiary-foreground",
                  current && "border-primary bg-primary text-primary-foreground",
                  completed && !current && "border-primary bg-background text-primary",
                  clickable && "group-hover:border-primary"
                )}
                aria-hidden="true"
              >
                {completed && !current ? (
                  <CheckIcon />
                ) : (
                  index + 1
                )}
              </div>
              {!isLast(index) && (
                <div
                  className={cn(
                    "w-0 border-l-2 border-dashed border-border-strong flex-1 min-h-4 transition-colors duration-200",
                    completed && "border-l-primary"
                  )}
                />
              )}
            </div>
            <div className="flex items-center min-h-9">
              <span
                className={cn(
                  "text-sm font-semibold text-tertiary-foreground leading-tight transition-colors duration-150",
                  current && "text-accent-hover font-bold",
                  completed && !current && "text-muted-foreground",
                  clickable && "group-hover:text-accent-hover"
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 7l3 3 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
