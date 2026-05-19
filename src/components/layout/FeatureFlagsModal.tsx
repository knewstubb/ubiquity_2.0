import { useState, useCallback } from 'react';
import { Plus, Trash } from '@phosphor-icons/react';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import type { FeatureFlag } from '../../contexts/FeatureFlagContext';
import { cn } from '../../lib/utils';
import { CloseButton } from '../ui/close-button';

interface FeatureFlagsModalProps {
  onClose: () => void;
}

export function FeatureFlagsModal({ onClose }: FeatureFlagsModalProps) {
  const { flags, setFlagEnabled, createFlag, deleteFlag } = useFeatureFlags();
  const [showAddForm, setShowAddForm] = useState(false);

  const flagList = Object.values(flags).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-xl w-[560px] max-w-[90vw] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-semibold text-foreground m-0">Feature Flags</h2>
          <CloseButton
            size="lg"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <p className="px-6 pt-2 text-[13px] text-muted-foreground m-0">
          Control which pages and features are visible to users. Disabled flags hide the associated page or component.
        </p>

        <div className="px-6 py-4 overflow-y-auto flex-1 flex flex-col">
          {flagList.length === 0 && !showAddForm && (
            <p className="text-center py-6 text-sm text-tertiary-foreground">
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

        <div className="px-6 py-3 pb-4 border-t border-border">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-sans font-semibold text-primary bg-none border border-primary rounded cursor-pointer transition-colors duration-150 hover:bg-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{flag.name}</span>
          <span className="text-[11px] font-medium text-tertiary-foreground bg-secondary px-1.5 py-px rounded-[3px] uppercase tracking-[0.03em]">{flag.scope}</span>
        </div>
        {flag.description && <p className="text-[13px] text-muted-foreground mt-0.5 mb-0">{flag.description}</p>}
        {flag.target && <p className="text-xs text-tertiary-foreground mt-0.5 mb-0 font-mono">{flag.target}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <label className="relative inline-flex cursor-pointer">
          <input
            type="checkbox"
            checked={flag.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="absolute opacity-0 w-0 h-0"
          />
          <span className={cn(
            "w-9 h-5 rounded-[10px] relative transition-colors duration-200",
            flag.enabled ? "bg-primary" : "bg-border-strong"
          )}>
            <span className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition-transform duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.15)]",
              flag.enabled && "translate-x-4"
            )} />
          </span>
        </label>
        <button
          type="button"
          className="inline-flex items-center justify-center w-7 h-7 border-none bg-none rounded text-tertiary-foreground cursor-pointer transition-colors duration-150 hover:bg-destructive-subtle hover:text-destructive"
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
    <form className="py-3 border-t border-border flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          className="flex-1 px-2.5 py-2 text-[13px] font-sans border border-border rounded outline-none text-foreground transition-colors duration-150 focus:border-primary focus:shadow-[--ring-shadow]"
          placeholder="Flag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <select
          className="px-2.5 py-2 text-[13px] font-sans border border-border rounded outline-none cursor-pointer bg-background text-foreground"
          value={scope}
          onChange={(e) => setScope(e.target.value as 'page' | 'component')}
        >
          <option value="page">Page</option>
          <option value="component">Component</option>
        </select>
      </div>
      <input
        className="flex-1 px-2.5 py-2 text-[13px] font-sans border border-border rounded outline-none text-foreground transition-colors duration-150 focus:border-primary focus:shadow-[--ring-shadow]"
        placeholder="Route path or component target (e.g. /admin/billing)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <input
        className="flex-1 px-2.5 py-2 text-[13px] font-sans border border-border rounded outline-none text-foreground transition-colors duration-150 focus:border-primary focus:shadow-[--ring-shadow]"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[13px] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enabled
        </label>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="px-3 py-1.5 text-[13px] font-sans font-medium text-muted-foreground bg-background border border-border rounded cursor-pointer hover:bg-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-[13px] font-sans font-semibold text-primary-foreground bg-primary border-none rounded cursor-pointer hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
