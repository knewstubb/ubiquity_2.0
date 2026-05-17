import { Button } from '../ui/button';

interface WizardNavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  canProceed: boolean;
  isLast: boolean;
  showBack?: boolean;
  submitLabel?: string;
}

export function WizardNavButtons({
  onBack,
  onNext,
  onCancel,
  canProceed,
  isLast,
  showBack = true,
  submitLabel,
}: WizardNavButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="outline" onClick={onBack} disabled={!showBack}>
        Back
      </Button>
      <Button disabled={!canProceed} onClick={onNext}>
        {isLast ? (submitLabel ?? 'Save') : 'Next'}
      </Button>
    </div>
  );
}
