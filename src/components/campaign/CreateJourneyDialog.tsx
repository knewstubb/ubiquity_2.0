import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { Campaign, JourneyType } from '../../models/campaign';

const JOURNEY_TYPES: { value: JourneyType; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 're-engagement', label: 'Re-engagement' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'promotional', label: 'Promotional' },
];

interface CreateJourneyDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, campaignId: string, type: JourneyType) => void;
  campaigns: Campaign[];
  defaultCampaignId?: string;
}

export function CreateJourneyDialog({
  open,
  onClose,
  onCreate,
  campaigns,
  defaultCampaignId,
}: CreateJourneyDialogProps) {
  const [name, setName] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [journeyType, setJourneyType] = useState<JourneyType>('welcome');
  const [showValidation, setShowValidation] = useState(false);

  const nameTrimmed = name.trim();
  const isNameValid = nameTrimmed.length > 0;
  const isCampaignValid = campaignId.length > 0;
  const isFormValid = isNameValid && isCampaignValid;

  useEffect(() => {
    if (open) {
      setName('');
      setCampaignId(defaultCampaignId || (campaigns.length === 1 ? campaigns[0].id : ''));
      setJourneyType('welcome');
      setShowValidation(false);
    }
  }, [open, defaultCampaignId, campaigns]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }
    onCreate(nameTrimmed, campaignId, journeyType);
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-journey-title"
    >
      <form
        className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[480px] animate-in slide-in-from-bottom-2 duration-200"
        onSubmit={handleSubmit}
      >
        <h2
          id="create-journey-title"
          className="m-0 mb-4 text-lg font-semibold text-foreground"
        >
          Create Journey
        </h2>

        {/* Journey Name */}
        <div className="mb-4">
          <label
            className="block mb-1 text-sm font-medium text-foreground"
            htmlFor="journey-name"
          >
            Journey Name<span className="text-destructive ml-0.5">*</span>
          </label>
          <input
            id="journey-name"
            className={cn(
              'w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background outline-none transition-colors duration-150 box-border',
              'focus:border-primary focus:ring-2 focus:ring-primary/15',
              showValidation &&
                !isNameValid &&
                'border-destructive focus:border-destructive focus:ring-destructive/15',
            )}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (showValidation && e.target.value.trim().length > 0) {
                setShowValidation(false);
              }
            }}
            placeholder="Enter journey name"
            autoFocus
          />
          {showValidation && !isNameValid && (
            <p className="mt-1 text-xs text-destructive">Journey name is required</p>
          )}
        </div>

        {/* Campaign Picker */}
        <div className="mb-4">
          <label
            className="block mb-1 text-sm font-medium text-foreground"
            htmlFor="journey-campaign"
          >
            Campaign<span className="text-destructive ml-0.5">*</span>
          </label>
          <select
            id="journey-campaign"
            className={cn(
              'w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background outline-none transition-colors duration-150 box-border',
              'focus:border-primary focus:ring-2 focus:ring-primary/15',
              showValidation &&
                !isCampaignValid &&
                'border-destructive focus:border-destructive focus:ring-destructive/15',
            )}
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            <option value="">Select a campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {showValidation && !isCampaignValid && (
            <p className="mt-1 text-xs text-destructive">Please select a campaign</p>
          )}
        </div>

        {/* Journey Type */}
        <div className="mb-4">
          <label
            className="block mb-1 text-sm font-medium text-foreground"
            htmlFor="journey-type"
          >
            Journey Type
          </label>
          <select
            id="journey-type"
            className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background outline-none transition-colors duration-150 box-border focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={journeyType}
            onChange={(e) => setJourneyType(e.target.value as JourneyType)}
          >
            {JOURNEY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
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
            disabled={!isFormValid}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
