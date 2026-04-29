import { useState, useCallback } from 'react';
import { X, Plus, Trash } from '@phosphor-icons/react';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import type { FeatureFlag } from '../../contexts/FeatureFlagContext';
import styles from './FeatureFlagsModal.module.css';

interface FeatureFlagsModalProps {
  onClose: () => void;
}

export function FeatureFlagsModal({ onClose }: FeatureFlagsModalProps) {
  const { flags, setFlagEnabled, createFlag, deleteFlag } = useFeatureFlags();
  const [showAddForm, setShowAddForm] = useState(false);

  const flagList = Object.values(flags).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Feature Flags</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <p className={styles.subtitle}>
          Control which pages and features are visible to users. Disabled flags hide the associated page or component.
        </p>

        <div className={styles.body}>
          {flagList.length === 0 && !showAddForm && (
            <p className={styles.emptyState}>
              No feature flags configured. All pages are visible by default.
            </p>
          )}

          {flagList.map((flag) => (
            <FlagRow
              key={flag.name}
              flag={flag}
              onToggle={(enabled) => setFlagEnabled(flag.name, enabled)}
              onDelete={() => deleteFlag(flag.name)}
            />
          ))}

          {showAddForm && (
            <AddFlagForm
              onAdd={(flag) => {
                createFlag(flag);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <Plus size={14} weight="bold" />
            Add Flag
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Flag Row ── */

interface FlagRowProps {
  flag: FeatureFlag;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}

function FlagRow({ flag, onToggle, onDelete }: FlagRowProps) {
  return (
    <div className={styles.flagRow}>
      <div className={styles.flagInfo}>
        <div className={styles.flagNameRow}>
          <span className={styles.flagName}>{flag.name}</span>
          <span className={styles.flagScope}>{flag.scope}</span>
        </div>
        {flag.description && <p className={styles.flagDesc}>{flag.description}</p>}
        {flag.target && <p className={styles.flagTarget}>Target: {flag.target}</p>}
      </div>
      <div className={styles.flagActions}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={flag.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className={styles.toggleInput}
          />
          <span className={`${styles.toggleTrack} ${flag.enabled ? styles.toggleTrackOn : ''}`}>
            <span className={styles.toggleThumb} />
          </span>
        </label>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={onDelete}
          aria-label={`Delete ${flag.name}`}
          title="Delete flag"
        >
          <Trash size={14} weight="regular" />
        </button>
      </div>
    </div>
  );
}

/* ── Add Flag Form ── */

interface AddFlagFormProps {
  onAdd: (flag: Omit<FeatureFlag, 'enabled'> & { enabled?: boolean }) => void;
  onCancel: () => void;
}

function AddFlagForm({ onAdd, onCancel }: AddFlagFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'page' | 'component'>('page');
  const [target, setTarget] = useState('');
  const [enabled, setEnabled] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      onAdd({ name: name.trim(), description, scope, target, enabled });
    },
    [name, description, scope, target, enabled, onAdd],
  );

  return (
    <form className={styles.addForm} onSubmit={handleSubmit}>
      <div className={styles.addFormRow}>
        <input
          className={styles.addInput}
          placeholder="Flag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <select
          className={styles.addSelect}
          value={scope}
          onChange={(e) => setScope(e.target.value as 'page' | 'component')}
        >
          <option value="page">Page</option>
          <option value="component">Component</option>
        </select>
      </div>
      <input
        className={styles.addInput}
        placeholder="Route path or component target (e.g. /admin/billing)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <input
        className={styles.addInput}
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className={styles.addFormActions}>
        <label className={styles.addCheckLabel}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enabled
        </label>
        <div className={styles.addFormBtns}>
          <button type="button" className={styles.cancelFormBtn} onClick={onCancel}>Cancel</button>
          <button type="submit" className={styles.saveFormBtn} disabled={!name.trim()}>Add</button>
        </div>
      </div>
    </form>
  );
}
