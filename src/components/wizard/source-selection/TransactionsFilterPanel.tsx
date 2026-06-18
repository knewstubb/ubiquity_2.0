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
    <div className="flex flex-col gap-1.5" data-testid="transactions-filter-panel">
      {FILTER_OPTIONS.map((option) => (
        <div key={option.value} className="flex flex-col">
          <button
            type="button"
            onClick={() => handleTypeChange(option.value)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md border text-left text-sm transition-colors duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              config.type === option.value
                ? 'border-primary bg-accent'
                : 'border-border bg-background hover:border-primary/50 hover:bg-accent/25',
            )}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
                config.type === option.value ? 'border-primary' : 'border-muted-foreground',
              )}
            >
              {config.type === option.value && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="font-medium text-foreground">{option.label}</span>
          </button>

          {/* Secondary input: Days — directly below selected card */}
          {config.type === option.value && option.value === 'created_in_last_n_days' && (
            <div className="mt-2 mb-1 bg-muted rounded-lg p-3 flex flex-col gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={config.days ?? ''}
                onChange={(e) => handleDaysChange(e.target.value)}
                placeholder="Number of days (1–365)"
                aria-label="Number of days"
                aria-invalid={daysInvalid || undefined}
                className="max-w-[160px]"
              />
              {daysInvalid && (
                <p className="text-xs text-destructive m-0">
                  Enter a whole number between 1 and 365
                </p>
              )}
            </div>
          )}

          {/* Secondary input: Field filter builder — directly below selected card */}
          {config.type === option.value && option.value === 'field_filter' && (
            <div className="mt-2 mb-1 bg-muted rounded-lg p-3 flex flex-col gap-3">

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

                      <div className="flex-1 min-w-0">
                        <Input
                          value={row.value}
                          onChange={(e) => handleFilterRowChange(index, { value: e.target.value })}
                          placeholder="Value"
                          aria-label={`Filter row ${index + 1} value`}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="secondaryGhost"
                        size="icon"
                        onClick={() => handleRemoveRow(index)}
                        aria-label={`Remove filter row ${index + 1}`}
                        className="shrink-0"
                      >
                        <X weight="bold" />
                      </Button>
                    </div>

                    {incomplete && (row.field !== '' || row.operator !== '' || row.value !== '') && (
                      <p className="text-xs text-destructive m-0">
                        All fields are required — select a field, operator, and enter a value
                      </p>
                    )}
                  </div>
                );
              })}

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
      ))}
    </div>
  );
}
