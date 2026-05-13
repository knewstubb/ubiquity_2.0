import { Button } from '../ui/button';

interface WizardNavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  canProceed: boolean;
  isLast: boolean;
  showBack?: boolean;
}

export function WizardNavButtons({
  onBack,
  onNext,
  onCancel,
  canProceed,
  isLast,
  showBack = true,
}: WizardNavButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      {showBack && (
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      )}
      <Button disabled={!canProceed} onClick={onNext}>
        {isLast ? 'Save' : 'Next'}
      </Button>
    </div>
  );
}
