import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface WizardNavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  canProceed: boolean;
  isLast: boolean;
  showBack?: boolean;
  submitLabel?: string;
  /** Reason the Next button is disabled — shown as tooltip on hover */
  disabledReason?: string;
}

export function WizardNavButtons({
  onBack,
  onNext,
  onCancel,
  canProceed,
  isLast,
  showBack = true,
  submitLabel,
  disabledReason,
}: WizardNavButtonsProps) {
  const nextButton = (
    <Button disabled={!canProceed} onClick={onNext}>
      {isLast ? (submitLabel ?? 'Save') : 'Next'}
    </Button>
  );

  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="secondaryGhost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="outline" onClick={onBack} disabled={!showBack}>
        Back
      </Button>
      {!canProceed && disabledReason ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>{nextButton}</span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {disabledReason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        nextButton
      )}
    </div>
  );
}
