import styles from './WizardStepper.module.css';

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
    <nav className={styles.stepper} aria-label="Wizard progress">
      {steps.map((step, index) => {
        const completed = isCompleted(index);
        const current = isCurrent(index);
        const clickable = isClickable(index);

        const circleClass = [
          styles.circle,
          current ? styles.circleCurrent : '',
          completed && !current ? styles.circleCompleted : '',
        ]
          .filter(Boolean)
          .join(' ');

        const labelClass = [
          styles.label,
          current ? styles.labelCurrent : '',
          completed && !current ? styles.labelCompleted : '',
        ]
          .filter(Boolean)
          .join(' ');

        const stepClass = [
          styles.step,
          clickable ? styles.stepClickable : '',
        ]
          .filter(Boolean)
          .join(' ');

        const lineClass = [
          styles.line,
          completed ? styles.lineCompleted : '',
        ]
          .filter(Boolean)
          .join(' ');

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
            className={stepClass}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-current={current ? 'step' : undefined}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            <div className={styles.indicator}>
              <div className={circleClass} aria-hidden="true">
                {completed && !current ? (
                  <CheckIcon />
                ) : (
                  index + 1
                )}
              </div>
              {!isLast(index) && <div className={lineClass} />}
            </div>
            <div className={styles.content}>
              <span className={labelClass}>{step.label}</span>
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
