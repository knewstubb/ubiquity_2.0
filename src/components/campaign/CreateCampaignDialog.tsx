import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface CreateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, goal: string) => void;
}

export function CreateCampaignDialog({
  open,
  onClose,
  onCreate,
}: CreateCampaignDialogProps) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const nameTrimmed = name.trim();
  const isNameValid = nameTrimmed.length > 0;

  useEffect(() => {
    if (open) {
      setName('');
      setGoal('');
      setShowValidation(false);
    }
  }, [open]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isNameValid) {
      setShowValidation(true);
      return;
    }
    onCreate(nameTrimmed, goal.trim());
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-campaign-title"
    >
      <form className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[480px] animate-in slide-in-from-bottom-2 duration-200" onSubmit={handleSubmit}>
        <h2 id="create-campaign-title" className="m-0 mb-4 text-lg font-semibold text-foreground">
          Create Campaign
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-foreground" htmlFor="campaign-name">
            Campaign Name<span className="text-destructive ml-0.5">*</span>
          </label>
          <input
            id="campaign-name"
            className={cn(
              "w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background outline-none transition-colors duration-150 box-border",
              "focus:border-primary focus:ring-2 focus:ring-primary/15",
              showValidation && !isNameValid && "border-destructive focus:border-destructive focus:ring-destructive/15"
            )}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (showValidation && e.target.value.trim().length > 0) {
                setShowValidation(false);
              }
            }}
            placeholder="Enter campaign name"
            autoFocus
          />
          {showValidation && !isNameValid && (
            <p className="mt-1 text-xs text-destructive">Campaign name is required</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-foreground" htmlFor="campaign-goal">
            Goal
          </label>
          <textarea
            id="campaign-goal"
            className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background outline-none transition-colors duration-150 resize-y min-h-[80px] font-[inherit] box-border focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe the campaign goal (optional)"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border-none rounded-md bg-primary text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:not-disabled:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isNameValid}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
