import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import type { Asset, AssetType, AssetScope } from '../../models/asset';
import type { Campaign } from '../../models/campaign';
import { Dropdown } from '../shared/Dropdown';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  campaigns: Campaign[];
  currentAccountId: string;
}

const TYPE_OPTIONS = [
  { value: 'image', label: 'Image' },
  { value: 'colour', label: 'Colour' },
  { value: 'font', label: 'Font' },
  { value: 'footer', label: 'Footer' },
];

export function UploadDialog({ open, onClose, onUpload, campaigns, currentAccountId }: UploadDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('image');
  const [scope, setScope] = useState<AssetScope>('global');
  const [campaignId, setCampaignId] = useState<string>(campaigns[0]?.id ?? '');
  const [colourValue, setColourValue] = useState('#14B88A');
  const [touched, setTouched] = useState(false);

  const nameInvalid = touched && name.trim() === '';
  const canSubmit = name.trim() !== '';

  const resetForm = useCallback(() => {
    setName('');
    setType('image');
    setScope('global');
    setCampaignId(campaigns[0]?.id ?? '');
    setColourValue('#14B88A');
    setTouched(false);
  }, [campaigns]);

  function handleSubmit() {
    setTouched(true);
    if (!canSubmit) return;

    const asset: Omit<Asset, 'id' | 'createdAt'> = {
      name: name.trim(),
      type,
      scope,
      accountId: currentAccountId,
      campaignId: scope === 'campaign' ? campaignId : null,
      tags: [],
      ...(type === 'colour' ? { colourValue } : {}),
    };

    onUpload(asset);
    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  if (!open) return null;

  const campaignOptions = campaigns.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-[fadeIn_200ms_ease]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
    >
      <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[480px] animate-[slideUp_200ms_ease]">
        <h2 id="upload-dialog-title" className="m-0 mb-5 text-lg font-semibold text-foreground">Upload Asset</h2>

        <div className="flex flex-col gap-4">
          {/* Name input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-name" className="text-sm font-medium text-muted-foreground">Name</label>
            <input
              id="asset-name"
              type="text"
              className={cn(
                "py-2 px-3 text-sm text-foreground bg-background border border-border rounded-md transition-[border-color,box-shadow] duration-150 leading-normal focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--accent)]",
                nameInvalid && "border-destructive"
              )}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Enter asset name"
            />
            {nameInvalid && <span className="text-xs text-destructive">Name is required</span>}
          </div>

          {/* Type dropdown */}
          <div className="flex flex-col gap-1">
            <Dropdown
              label="Type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
            />
          </div>

          {/* Scope radio group */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Scope</span>
            <div className="flex gap-4">
              {(['global', 'campaign', 'account'] as AssetScope[]).map((s) => (
                <label key={s} className="flex items-center gap-1 text-sm text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="asset-scope"
                    value={s}
                    checked={scope === s}
                    onChange={() => setScope(s)}
                    className="accent-primary"
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Campaign picker (shown when scope is campaign) */}
          {scope === 'campaign' && (
            <div className="flex flex-col gap-1">
              <Dropdown
                label="Campaign"
                options={campaignOptions}
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Select a campaign"
              />
            </div>
          )}

          {/* Hex colour input (shown when type is colour) */}
          {type === 'colour' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="asset-colour" className="text-sm font-medium text-muted-foreground">Hex Colour</label>
              <input
                id="asset-colour"
                type="text"
                className="py-2 px-3 text-sm text-foreground bg-background border border-border rounded-md transition-[border-color,box-shadow] duration-150 leading-normal focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--accent)]"
                value={colourValue}
                onChange={(e) => setColourValue(e.target.value)}
                placeholder="#000000"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="py-2 px-4 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="py-2 px-4 border-none rounded-md bg-primary text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
