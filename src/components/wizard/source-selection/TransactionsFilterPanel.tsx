import { useCallback } from 'react';
import { Plus, X } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { validateDays } from '../../../utils/source-selection-validation';
import type { TransactionsFilterConfig, TransactionsFilterType, FieldFilterRow } from '../../../models/source-selection';
import type { SourceFieldDefinition } from '../../../utils/source-config-utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TransactionsFilterPanelProps {
  config: TransactionsFilterConfig;
  onChange: (config: TransactionsFilterConfig) => void;
  tableFields: SourceFieldDefinition[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: TransactionsFilterType; label: string; description: string }[] = [
  { value: 'all', label: 'All records', description: 'Export every record in this table' },
  { value: 'created_in_last_n_days', label: 'Created in last N days', description: 'Records created within a recent time window' },
  { value: 'field_filter', label: 'Field filter', description: 'Filter by specific field values' },
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
];

const MOCK_FIELDS: SourceFieldDefinition[] = [
  { key: 'amount', label: 'Amount', source: 'transactions' },
  { key: 'date', label: 'Date', source: 'transactions' },
  { key: 'type', label: 'Type', source: 'transactions' },
  { key: 'status', label: 'Status', source: 'transactions' },
  { key: 'product', label: 'Product', source: 'transactions' },
];

const MAX_FILTER_ROWS = 10;

// ─── Component ───────────────────────────────────────────────────────────────

export function TransactionsFilterPanel({ config, onChange, tableFields }: TransactionsFilterPanelProps) {
  const fields = tableFields.length > 0 ? tableFields : MOCK_FIELDS;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleTypeChange = useCallback(
    (type: TransactionsFilterType) => {
      if (type === config.type) return;

      const base: TransactionsFilterConfig = { type };
      if (type === 'created_in_last_n_days') {
        base.days = undefined;
      } else if (type === 'field_filter') {
        base.fieldFilters = [{ field: '', operator: '', value: '' }];
      }
      onChange(base);
    },
    [config.type, onChange],
  );

  const handleDaysChange = useCallback(
    (value: string) => {
      const parsed = value === '' ? undefined : Number(value);
      onChange({ ...config, days: parsed });
    },
    [config, onChange],
  );

  const handleFilterRowChange = useCallback(
    (index: number, patch: Partial<FieldFilterRow>) => {
      const rows = [...(config.fieldFilters ?? [])];
      rows[index] = { ...rows[index], ...patch };
      onChange({ ...config, fieldFilters: rows });
    },
    [config, onChange],
  );

  const handleAddRow = useCallback(() => {
    const rows = [...(config.fieldFilters ?? [])];
    if (rows.length >= MAX_FILTER_ROWS) return;
    rows.push({ field: '', operator: '', value: '' });
    onChange({ ...config, fieldFilters: rows });
  }, [config, onChange]);

  const handleRemoveRow = useCallback(
    (index: number) => {
      const rows = [...(config.fieldFilters ?? [])];
      rows.splice(index, 1);
      // Keep at least one row
      if (rows.length === 0) {
        rows.push({ field: '', operator: '', value: '' });
      }
      onChange({ ...config, fieldFilters: rows });
    },
    [config, onChange],
  );

  // ─── Validation helpers ──────────────────────────────────────────────────────

  const daysInvalid = config.type === 'created_in_last_n_days' && config.days !== undefined && !validateDays(config.days);

  function isRowIncomplete(row: FieldFilterRow): boolean {
    return row.field === '' || row.operator === '' || row.value === '';
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3" data-testid="transactions-filter-panel">
      {/* Filter type radio-style buttons */}
      <div className="flex flex-col gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleTypeChange(option.value)}
            className={cn(
              'flex flex-col items-start rounded-md border px-4 py-3 text-left transition-colors',
              config.type === option.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border-strong hover:bg-secondary/50',
            )}
          >
            <span className={cn(
              'text-sm font-medium',
              config.type === option.value ? 'text-primary' : 'text-foreground',
            )}>
              {option.label}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
          </button>
        ))}
      </div>

      {/* Secondary input: Days */}
      {config.type === 'created_in_last_n_days' && (
        <div className="bg-muted rounded-lg p-4 flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Number of days
          </label>
          <Input
            type="number"
            min={1}
            max={365}
            value={config.days ?? ''}
            onChange={(e) => handleDaysChange(e.target.value)}
            placeholder="e.g. 30"
            aria-label="Number of days"
            aria-invalid={daysInvalid || undefined}
          />
          {daysInvalid && (
            <p className="text-xs text-destructive m-0">
              Enter a whole number between 1 and 365
            </p>
          )}
        </div>
      )}

      {/* Secondary input: Field filter builder */}
      {config.type === 'field_filter' && (
        <div className="bg-muted rounded-lg p-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground m-0">
            Filter rows (AND logic)
          </p>

          {(config.fieldFilters ?? []).map((row, index) => {
            const showAnd = index > 0;
            const incomplete = isRowIncomplete(row);

            return (
              <div key={index} className="flex flex-col gap-2">
                {showAnd && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    AND
                  </span>
                )}
                <div className="flex items-start gap-2">
                  {/* Field selector */}
                  <div className="flex-1 min-w-0">
                    <Select
                      value={row.field || undefined}
                      onValueChange={(v) => handleFilterRowChange(index, { field: v })}
                    >
                      <SelectTrigger aria-label={`Filter row ${index + 1} field`}>
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((f) => (
                          <SelectItem key={f.key} value={f.key}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator selector */}
                  <div className="flex-1 min-w-0">
                    <Select
                      value={row.operator || undefined}
                      onValueChange={(v) => handleFilterRowChange(index, { operator: v })}
                    >
                      <SelectTrigger aria-label={`Filter row ${index + 1} operator`}>
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value input */}
                  <div className="flex-1 min-w-0">
                    <Input
                      value={row.value}
                      onChange={(e) => handleFilterRowChange(index, { value: e.target.value })}
                      placeholder="Value"
                      aria-label={`Filter row ${index + 1} value`}
                    />
                  </div>

                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(index)}
                    aria-label={`Remove filter row ${index + 1}`}
                    className="shrink-0"
                  >
                    <X weight="bold" />
                  </Button>
                </div>

                {/* Inline validation for incomplete rows */}
                {incomplete && (row.field !== '' || row.operator !== '' || row.value !== '') && (
                  <p className="text-xs text-destructive m-0">
                    All fields are required — select a field, operator, and enter a value
                  </p>
                )}
              </div>
            );
          })}

          {/* Add filter row button */}
          {(config.fieldFilters ?? []).length < MAX_FILTER_ROWS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="self-start"
            >
              <Plus weight="bold" />
              Add filter
            </Button>
          )}

          {(config.fieldFilters ?? []).length >= MAX_FILTER_ROWS && (
            <p className="text-xs text-muted-foreground m-0">
              Maximum of {MAX_FILTER_ROWS} filter rows reached
            </p>
          )}
        </div>
      )}
    </div>
  );
}
