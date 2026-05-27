import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionsFilterPanel } from './TransactionsFilterPanel';
import type { TransactionsFilterConfig } from '../../../models/source-selection';
import type { SourceFieldDefinition } from '../../../utils/source-config-utils';

const MOCK_FIELDS: SourceFieldDefinition[] = [
  { key: 'amount', label: 'Amount', source: 'transactions' },
  { key: 'date', label: 'Date', source: 'transactions' },
  { key: 'type', label: 'Type', source: 'transactions' },
];

function createConfig(overrides: Partial<TransactionsFilterConfig> = {}): TransactionsFilterConfig {
  return { type: 'all', ...overrides };
}

describe('TransactionsFilterPanel', () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  describe('Filter type selection', () => {
    it('renders three filter options', () => {
      render(
        <TransactionsFilterPanel config={createConfig()} onChange={onChange} tableFields={MOCK_FIELDS} />,
      );
      expect(screen.getByText('All records')).toBeInTheDocument();
      expect(screen.getByText('Created in last N days')).toBeInTheDocument();
      expect(screen.getByText('Field filter')).toBeInTheDocument();
    });

    it('highlights the selected filter type', () => {
      render(
        <TransactionsFilterPanel config={createConfig({ type: 'all' })} onChange={onChange} tableFields={MOCK_FIELDS} />,
      );
      const allButton = screen.getByText('All records').closest('button');
      expect(allButton?.className).toContain('border-primary');
    });

    it('calls onChange with new type when a different filter is selected', () => {
      render(
        <TransactionsFilterPanel config={createConfig({ type: 'all' })} onChange={onChange} tableFields={MOCK_FIELDS} />,
      );
      fireEvent.click(screen.getByText('Created in last N days'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'created_in_last_n_days' }),
      );
    });

    it('does not call onChange when clicking the already-selected type', () => {
      render(
        <TransactionsFilterPanel config={createConfig({ type: 'all' })} onChange={onChange} tableFields={MOCK_FIELDS} />,
      );
      fireEvent.click(screen.getByText('All records'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Days input (created_in_last_n_days)', () => {
    it('shows days input when created_in_last_n_days is selected', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'created_in_last_n_days' })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.getByLabelText('Number of days')).toBeInTheDocument();
    });

    it('does not show days input when all is selected', () => {
      render(
        <TransactionsFilterPanel config={createConfig({ type: 'all' })} onChange={onChange} tableFields={MOCK_FIELDS} />,
      );
      expect(screen.queryByLabelText('Number of days')).not.toBeInTheDocument();
    });

    it('calls onChange with parsed days value', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'created_in_last_n_days' })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      fireEvent.change(screen.getByLabelText('Number of days'), { target: { value: '30' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'created_in_last_n_days', days: 30 }),
      );
    });

    it('shows validation error for invalid days value', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'created_in_last_n_days', days: 400 })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.getByText(/whole number between 1 and 365/)).toBeInTheDocument();
    });

    it('does not show validation error for valid days value', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'created_in_last_n_days', days: 30 })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.queryByText(/whole number between 1 and 365/)).not.toBeInTheDocument();
    });
  });

  describe('Field filter builder', () => {
    it('shows filter builder when field_filter is selected', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.getByText('Filter rows (AND logic)')).toBeInTheDocument();
    });

    it('renders one filter row by default', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.getByLabelText('Filter row 1 field')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter row 1 operator')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter row 1 value')).toBeInTheDocument();
    });

    it('shows Add filter button', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.getByText('Add filter')).toBeInTheDocument();
    });

    it('calls onChange to add a new row when Add filter is clicked', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'field_filter', fieldFilters: [{ field: 'amount', operator: 'equals', value: '100' }] })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      fireEvent.click(screen.getByText('Add filter'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldFilters: [
            { field: 'amount', operator: 'equals', value: '100' },
            { field: '', operator: '', value: '' },
          ],
        }),
      );
    });

    it('shows AND label between multiple rows', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({
            type: 'field_filter',
            fieldFilters: [
              { field: 'amount', operator: 'equals', value: '100' },
              { field: 'type', operator: 'contains', value: 'purchase' },
            ],
          })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.getByText('AND')).toBeInTheDocument();
    });

    it('calls onChange to remove a row when remove button is clicked', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({
            type: 'field_filter',
            fieldFilters: [
              { field: 'amount', operator: 'equals', value: '100' },
              { field: 'type', operator: 'contains', value: 'purchase' },
            ],
          })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      fireEvent.click(screen.getByLabelText('Remove filter row 1'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldFilters: [{ field: 'type', operator: 'contains', value: 'purchase' }],
        }),
      );
    });

    it('keeps at least one row when removing the last row', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({
            type: 'field_filter',
            fieldFilters: [{ field: 'amount', operator: 'equals', value: '100' }],
          })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      fireEvent.click(screen.getByLabelText('Remove filter row 1'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldFilters: [{ field: '', operator: '', value: '' }],
        }),
      );
    });

    it('hides Add filter button when max rows (10) reached', () => {
      const tenRows = Array.from({ length: 10 }, (_, i) => ({
        field: `field_${i}`,
        operator: 'equals',
        value: `val_${i}`,
      }));
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'field_filter', fieldFilters: tenRows })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.queryByText('Add filter')).not.toBeInTheDocument();
      expect(screen.getByText(/Maximum of 10 filter rows/)).toBeInTheDocument();
    });

    it('shows inline validation for partially filled rows', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({
            type: 'field_filter',
            fieldFilters: [{ field: 'amount', operator: '', value: '' }],
          })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.getByText(/All fields are required/)).toBeInTheDocument();
    });

    it('does not show validation for completely empty rows', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({
            type: 'field_filter',
            fieldFilters: [{ field: '', operator: '', value: '' }],
          })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      expect(screen.queryByText(/All fields are required/)).not.toBeInTheDocument();
    });

    it('calls onChange when value input changes', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({
            type: 'field_filter',
            fieldFilters: [{ field: 'amount', operator: 'equals', value: '' }],
          })}
          onChange={onChange}
          tableFields={MOCK_FIELDS}
        />,
      );
      fireEvent.change(screen.getByLabelText('Filter row 1 value'), { target: { value: '500' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldFilters: [{ field: 'amount', operator: 'equals', value: '500' }],
        }),
      );
    });
  });

  describe('Mock fields fallback', () => {
    it('uses mock fields when tableFields is empty', () => {
      render(
        <TransactionsFilterPanel
          config={createConfig({ type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] })}
          onChange={onChange}
          tableFields={[]}
        />,
      );
      // The component should still render without errors
      expect(screen.getByLabelText('Filter row 1 field')).toBeInTheDocument();
    });
  });
});
