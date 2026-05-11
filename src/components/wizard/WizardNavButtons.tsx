import { cn } from '../../lib/utils';

interface WizardNavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLast: boolean;
  showBack?: boolean;
}

export function WizardNavButtons({
  onBack,
  onNext,
  canProceed,
  isLast,
  showBack = true,
}: WizardNavButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      {showBack && (
        <button
          type="button"
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-semibold leading-5 rounded-md cursor-pointer transition-opacity duration-200 ease-in-out bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:translate-y-px active:transition-transform active:duration-100 active:ease-in-out"
          onClick={onBack}
        >
          Back
        </button>
      )}
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center px-3 py-2 text-sm font-semibold leading-5 rounded-md cursor-pointer transition-opacity duration-200 ease-in-out bg-primary text-primary-foreground border border-primary hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:translate-y-px active:transition-transform active:duration-100 active:ease-in-out",
          !canProceed && "opacity-50 cursor-not-allowed"
        )}
        disabled={!canProceed}
        onClick={onNext}
      >
        {isLast ? 'Save' : 'Next'}
      </button>
    </div>
  );
}
