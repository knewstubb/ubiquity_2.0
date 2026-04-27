import { useState } from 'react';
import styles from './ImportConfigStep.module.css';

interface ImportConfigStepProps {
  type: 'contact' | 'transactional';
}

/* ── Reusable Help Popover (same pattern as FileSettingsStep) ── */
interface HelpPopoverProps {
  title: string;
  body: string;
}

function HelpPopover({ title, body }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={styles.popoverWrap}>
      <button
        type="button"
        className={styles.helpBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Help: ${title}`}
      >
        ?
      </button>
      {open && (
        <div className={styles.popover} role="tooltip">
          <div className={styles.popoverTitleRow}>
            <p className={styles.popoverTitle}>{title}</p>
            <button
              type="button"
              className={styles.popoverClose}
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              ✕
            </button>
          </div>
          <p className={styles.popoverBody}>{body}</p>
        </div>
      )}
    </span>
  );
}

/* ── Radio option data ── */
type UpdateType = 'append-update' | 'append' | 'update';
type BlankValueMode = 'preserve' | 'import';

const UPDATE_OPTIONS: { value: UpdateType; label: string; desc: string }[] = [
  {
    value: 'append-update',
    label: 'Append / Update',
    desc: 'add new records and update any that exist',
  },
  {
    value: 'append',
    label: 'Append',
    desc: 'add new records and ignore any that exist',
  },
  {
    value: 'update',
    label: 'Update',
    desc: 'ignore new records and update any that exist',
  },
];

const BLANK_OPTIONS: { value: BlankValueMode; label: string; desc: string }[] = [
  {
    value: 'preserve',
    label: 'Preserve Existing Data',
    desc: 'Blank values in the data will be ignored and any existing values in the UbiQuity database will be preserved',
  },
  {
    value: 'import',
    label: 'Import Blank Values',
    desc: 'Blank values in the data will overwrite any existing values in the UbiQuity database',
  },
];

const ALL_FIELD_OPTIONS = ['Email', 'Customer ID', 'Phone', 'First Name', 'Last Name'];
const DEFAULT_CHIPS = ['Email', 'Customer ID'];

/* ── Chip Input Component ── */
interface ChipInputProps {
  chips: string[];
  onRemove: (chip: string) => void;
  onAdd: (chip: string) => void;
  onClearAll: () => void;
  availableOptions: string[];
}

function ChipInput({ chips, onRemove, onAdd, onClearAll, availableOptions }: ChipInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const remaining = availableOptions.filter((o) => !chips.includes(o));

  return (
    <div>
      <p className={styles.chipInputLabel}>Fields to be Matched</p>
      <div className={styles.chipInputWrap}>
        {chips.map((chip) => (
          <span key={chip} className={styles.chip}>
            {chip}
            <button
              type="button"
              className={styles.chipRemove}
              onClick={() => onRemove(chip)}
              aria-label={`Remove ${chip}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          className={styles.chipInputField}
          placeholder={chips.length === 0 ? 'Select fields…' : ''}
          readOnly
          onFocus={() => setDropdownOpen(true)}
        />
        <div className={styles.chipActions}>
          {chips.length > 0 && (
            <button
              type="button"
              className={styles.chipClearAll}
              onClick={onClearAll}
              aria-label="Clear all fields"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            className={styles.chipDropdownBtn}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Toggle field dropdown"
          >
            <ChevronIcon />
          </button>
        </div>
        {dropdownOpen && remaining.length > 0 && (
          <div className={styles.chipDropdown}>
            {remaining.map((option) => (
              <div
                key={option}
                className={styles.chipDropdownItem}
                role="option"
                aria-selected={false}
                onClick={() => {
                  onAdd(option);
                  setDropdownOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onAdd(option);
                    setDropdownOpen(false);
                  }
                }}
                tabIndex={0}
              >
                {option}
              </div>
            ))}
          </div>
        )}
        {dropdownOpen && remaining.length === 0 && (
          <div className={styles.chipDropdown}>
            <div className={styles.chipDropdownItem} style={{ color: 'var(--color-text-muted)', cursor: 'default' }}>
              No more fields available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function ImportConfigStep({ type }: ImportConfigStepProps) {
  const [updateType, setUpdateType] = useState<UpdateType>('append-update');
  const [blankMode, setBlankMode] = useState<BlankValueMode>('preserve');
  const [chips, setChips] = useState<string[]>(DEFAULT_CHIPS);

  const pageTitle = type === 'contact' ? 'Contact Configuration' : 'Transactional Configuration';

  const handleRemoveChip = (chip: string) => {
    setChips((prev) => prev.filter((c) => c !== chip));
  };

  const handleAddChip = (chip: string) => {
    setChips((prev) => (prev.includes(chip) ? prev : [...prev, chip]));
  };

  const handleClearAll = () => {
    setChips([]);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.pageTitle}>{pageTitle}</h3>
      <p className={styles.subtitle}>Set how records are matched, updated, and deduplicated.</p>

      {/* Update Type */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Update Type</p>
            <HelpPopover
              title="Which update type should I choose?"
              body="Update/Append is the safest default. New records are added, and existing records are updated. Append only adds new records. Update only refreshes existing records."
            />
          </div>
          <p className={styles.labelHint}>
            Select which type of update you want. Click here for help with options.
          </p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.radioGroup}>
            {UPDATE_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.radioOption}>
                <span
                  className={`${styles.radioCircle} ${updateType === opt.value ? styles.radioCircleSelected : ''}`}
                >
                  {updateType === opt.value && <span className={styles.radioCircleInner} />}
                </span>
                <span>
                  <p className={styles.radioLabel}>{opt.label}</p>
                  <p className={styles.radioDesc}>{opt.desc}</p>
                </span>
                <input
                  type="radio"
                  name="updateType"
                  value={opt.value}
                  checked={updateType === opt.value}
                  onChange={() => setUpdateType(opt.value)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Blank Values */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Blank Values</p>
            <HelpPopover
              title="What happens when a field in my file is empty?"
              body="Preserve existing data means blanks are treated as no change. Import blank values means blanks will clear existing data."
            />
          </div>
          <p className={styles.labelHint}>
            Choose how to handle blank values in the import
          </p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.radioGroup}>
            {BLANK_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.radioOption}>
                <span
                  className={`${styles.radioCircle} ${blankMode === opt.value ? styles.radioCircleSelected : ''}`}
                >
                  {blankMode === opt.value && <span className={styles.radioCircleInner} />}
                </span>
                <span>
                  <p className={styles.radioLabel}>{opt.label}</p>
                  <p className={styles.radioDesc}>{opt.desc}</p>
                </span>
                <input
                  type="radio"
                  name="blankMode"
                  value={opt.value}
                  checked={blankMode === opt.value}
                  onChange={() => setBlankMode(opt.value)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Matching Fields */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Matching Fields</p>
            <HelpPopover
              title="How does UbiQuity know if a record already exists?"
              body="Matching Fields are the columns used to decide whether each row is new or an update. Choose fields that uniquely identify a record, like email address."
            />
          </div>
          <p className={styles.labelHint}>
            Select the fields that will be used for matching records during updates
          </p>
        </div>
        <div className={styles.inputCol}>
          <ChipInput
            chips={chips}
            onRemove={handleRemoveChip}
            onAdd={handleAddChip}
            onClearAll={handleClearAll}
            availableOptions={ALL_FIELD_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path
        d="M1 1.5L6 6.5L11 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
