import { useState } from 'react';
import { CaretDown, X } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { HelpPopover } from '@/components/composed/help-popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface ImportConfigStepProps {
  type: 'contact' | 'transactional';
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
      <p className="text-xs font-medium text-muted-foreground m-0">Fields to be Matched</p>
      <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-[40px] relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]">
        {chips.map((chip) => (
          <span key={chip} className="inline-flex items-center gap-1 border border-primary text-primary rounded-full py-1 px-2 text-xs font-medium leading-none whitespace-nowrap">
            {chip}
            <button
              type="button"
              className="bg-transparent border-none text-primary cursor-pointer p-0 leading-none flex items-center hover:text-foreground"
              onClick={() => onRemove(chip)}
              aria-label={`Remove ${chip}`}
            >
              <X size={10} weight="bold" />
            </button>
          </span>
        ))}
        <input
          className="border-none outline-none text-sm text-foreground bg-transparent flex-1 min-w-[80px] py-0.5 px-0 placeholder:text-tertiary-foreground"
          placeholder={chips.length === 0 ? 'Select fields…' : ''}
          readOnly
          onFocus={() => setDropdownOpen(true)}
        />
        <div className="flex items-center gap-1 ml-auto">
          {chips.length > 0 && (
            <button
              type="button"
              className="bg-transparent border-none text-tertiary-foreground cursor-pointer p-0.5 leading-none flex items-center hover:text-muted-foreground"
              onClick={onClearAll}
              aria-label="Clear all fields"
            >
              <X size={12} />
            </button>
          )}
          <button
            type="button"
            className="bg-transparent border-none text-tertiary-foreground cursor-pointer p-0.5 leading-none flex items-center hover:text-muted-foreground"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Toggle field dropdown"
          >
            <CaretDown size={12} />
          </button>
        </div>
        {dropdownOpen && remaining.length > 0 && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-background border border-border rounded-md shadow-md max-h-[180px] overflow-y-auto">
            {remaining.map((option) => (
              <div
                key={option}
                className="py-2 px-3 text-sm text-foreground cursor-pointer transition-colors duration-150 hover:bg-accent hover:text-accent-hover"
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
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-background border border-border rounded-md shadow-md max-h-[180px] overflow-y-auto">
            <div className="py-2 px-3 text-sm text-tertiary-foreground cursor-default">
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
    <div className="flex flex-col gap-8">
      <h3 className="m-0 text-lg font-semibold text-primary">{pageTitle}</h3>
      <p className="mt-[-20px] mb-0 text-sm text-tertiary-foreground">Set how records are matched, updated, and deduplicated.</p>

      {/* Update Type */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Update Type</p>
            <HelpPopover
              title="Which update type should I choose?"
              body="Update/Append is the safest default. New records are added, and existing records are updated. Append only adds new records. Update only refreshes existing records."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            Select which type of update you want. Click here for help with options.
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex flex-col gap-2.5">
            {UPDATE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer">
                <span
                  className={cn(
                    "w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center mt-px transition-colors duration-150",
                    updateType === opt.value ? "border-primary" : "border-tertiary-foreground"
                  )}
                >
                  {updateType === opt.value && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
                <span>
                  <p className="text-sm font-semibold text-foreground m-0 leading-snug">{opt.label}</p>
                  <p className="text-xs font-normal text-tertiary-foreground mt-0.5 mb-0">{opt.desc}</p>
                </span>
                <input
                  type="radio"
                  name="updateType"
                  value={opt.value}
                  checked={updateType === opt.value}
                  onChange={() => setUpdateType(opt.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Blank Values — only relevant when updating existing records */}
      {updateType !== 'append' && (
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Blank Values</p>
            <HelpPopover
              title="What happens when a field in my file is empty?"
              body="Preserve existing data means blanks are treated as no change. Import blank values means blanks will clear existing data."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            Choose how to handle blank values in the import
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex flex-col gap-2.5">
            {BLANK_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer">
                <span
                  className={cn(
                    "w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center mt-px transition-colors duration-150",
                    blankMode === opt.value ? "border-primary" : "border-tertiary-foreground"
                  )}
                >
                  {blankMode === opt.value && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
                <span>
                  <p className="text-sm font-semibold text-foreground m-0 leading-snug">{opt.label}</p>
                  <p className="text-xs font-normal text-tertiary-foreground mt-0.5 mb-0">{opt.desc}</p>
                </span>
                <input
                  type="radio"
                  name="blankMode"
                  value={opt.value}
                  checked={blankMode === opt.value}
                  onChange={() => setBlankMode(opt.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Matching Fields */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Matching Fields</p>
            <HelpPopover
              title="How does UbiQuity know if a record already exists?"
              body="Matching Fields are the columns used to decide whether each row is new or an update. Choose fields that uniquely identify a record, like email address."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            Select the fields that will be used for matching records during updates
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
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


