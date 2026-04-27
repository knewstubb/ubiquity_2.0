import { useState, useCallback } from 'react';
import type { Asset, AssetType, AssetScope } from '../../models/asset';
import type { Campaign } from '../../models/campaign';
import { Dropdown } from '../shared/Dropdown';
import styles from './UploadDialog.module.css';

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
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
    >
      <div className={styles.dialog}>
        <h2 id="upload-dialog-title" className={styles.title}>Upload Asset</h2>

        <div className={styles.form}>
          {/* Name input */}
          <div className={styles.field}>
            <label htmlFor="asset-name" className={styles.label}>Name</label>
            <input
              id="asset-name"
              type="text"
              className={`${styles.input} ${nameInvalid ? styles.inputError : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Enter asset name"
            />
            {nameInvalid && <span className={styles.errorText}>Name is required</span>}
          </div>

          {/* Type dropdown */}
          <div className={styles.field}>
            <Dropdown
              label="Type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
            />
          </div>

          {/* Scope radio group */}
          <div className={styles.field}>
            <span className={styles.label}>Scope</span>
            <div className={styles.radioGroup}>
              {(['global', 'campaign', 'account'] as AssetScope[]).map((s) => (
                <label key={s} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="asset-scope"
                    value={s}
                    checked={scope === s}
                    onChange={() => setScope(s)}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Campaign picker (shown when scope is campaign) */}
          {scope === 'campaign' && (
            <div className={styles.field}>
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
            <div className={styles.field}>
              <label htmlFor="asset-colour" className={styles.label}>Hex Colour</label>
              <input
                id="asset-colour"
                type="text"
                className={styles.input}
                value={colourValue}
                onChange={(e) => setColourValue(e.target.value)}
                placeholder="#000000"
              />
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.uploadButton}
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
