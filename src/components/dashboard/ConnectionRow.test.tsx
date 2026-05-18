import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionRow } from './ConnectionRow';
import type { Connection } from '../../models/connection';
import type { Automation } from '../../models/automation';

const mockConnection: Connection = {
  id: 'conn-1',
  name: 'Spa AWS S3 Bucket',
  protocol: 'S3',
  status: 'connected',
  config: { region: 'us-east-1', bucket: 'spa-exports', prefix: 'data/' },
};

const mockConnectors: Automation[] = [
  {
    id: 'c1',
    connectionId: 'conn-1',
    name: 'Daily Contacts',
    direction: 'export',
    dataType: 'contact',
    selectedFields: [],
    fileType: 'csv',
    formatOptions: { delimiter: ',', includeHeader: true, dateFormat: 'ISO8601', timezone: 'UTC' },
    fileNamingPattern: '{connector_name}_{date}',
    schedule: 'daily',
    filters: { combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    connectionId: 'conn-1',
    name: 'Weekly Treatments',
    direction: 'export',
    dataType: 'transactional',
    transactionalSource: 'treatments',
    selectedFields: [],
    fileType: 'json',
    formatOptions: { delimiter: ',', includeHeader: true, dateFormat: 'ISO8601', timezone: 'UTC' },
    fileNamingPattern: '{connector_name}_{date}_{timestamp}',
    schedule: 'weekly',
    filters: { combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] },
    status: 'paused',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockOnAddConnector = vi.fn();

function renderRow(connectors = mockConnectors) {
  return render(
    <MemoryRouter>
      <ConnectionRow
        connection={mockConnection}
        connectors={connectors}
        onAddConnector={mockOnAddConnector}
      >
        <div data-testid="child-content">Connector cards here</div>
      </ConnectionRow>
    </MemoryRouter>,
  );
}

describe('ConnectionRow', () => {
  beforeEach(() => {
    mockOnAddConnector.mockClear();
  });

  it('renders connection name', () => {
    renderRow();
    expect(screen.getByText('Spa AWS S3 Bucket')).toBeInTheDocument();
  });

  it('renders protocol label', () => {
    renderRow();
    expect(screen.getByText('AWS S3:')).toBeInTheDocument();
  });

  it('renders active automation count', () => {
    renderRow();
    // The count is split across span elements: "1 of 2 Automations Active"
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Automations Active/)).toBeInTheDocument();
  });

  it('shows "No Automations" when connectors array is empty', () => {
    renderRow([]);
    expect(screen.getByText('No Automations')).toBeInTheDocument();
  });

  it('has a connection actions menu button', () => {
    renderRow();
    expect(screen.getByLabelText('Connection actions')).toBeInTheDocument();
  });

  it('shows "Add Automation" in the dropdown menu', async () => {
    const user = userEvent.setup();
    renderRow();

    await user.click(screen.getByLabelText('Connection actions'));
    expect(screen.getByText('Add Automation')).toBeInTheDocument();
  });

  it('calls onAddConnector when "Add Automation" is selected from menu', async () => {
    const user = userEvent.setup();
    renderRow();

    await user.click(screen.getByLabelText('Connection actions'));
    await user.click(screen.getByText('Add Automation'));
    expect(mockOnAddConnector).toHaveBeenCalledWith('conn-1');
  });

  it('starts collapsed — collapsible content is closed', () => {
    const { container } = renderRow();
    const collapsibleContent = container.querySelector('[data-state]');
    // The Collapsible starts closed
    expect(collapsibleContent?.getAttribute('data-state')).toBe('closed');
  });

  it('expands on header click to show children', async () => {
    const user = userEvent.setup();
    const { container } = renderRow();

    // Click the connection name area to expand
    await user.click(screen.getByText('Spa AWS S3 Bucket'));
    const collapsibleContent = container.querySelector('[data-state="open"]');
    expect(collapsibleContent).toBeTruthy();
  });

  it('collapses on second click', async () => {
    const user = userEvent.setup();
    const { container } = renderRow();

    await user.click(screen.getByText('Spa AWS S3 Bucket'));
    expect(container.querySelector('[data-state="open"]')).toBeTruthy();

    await user.click(screen.getByText('Spa AWS S3 Bucket'));
    expect(container.querySelector('[data-state="open"]')).toBeNull();
  });

  it('shows "Edit Connection" in the dropdown menu', async () => {
    const user = userEvent.setup();
    renderRow();

    await user.click(screen.getByLabelText('Connection actions'));
    expect(screen.getByText('Edit Connection')).toBeInTheDocument();
  });

  it('shows "Delete Connection" in the dropdown menu', async () => {
    const user = userEvent.setup();
    renderRow();

    await user.click(screen.getByLabelText('Connection actions'));
    expect(screen.getByText('Delete Connection')).toBeInTheDocument();
  });

  it('disables "Delete Connection" when connectors exist', async () => {
    const user = userEvent.setup();
    renderRow();

    await user.click(screen.getByLabelText('Connection actions'));
    const deleteItem = screen.getByText('Delete Connection').closest('[role="menuitem"]');
    expect(deleteItem).toHaveAttribute('data-disabled');
  });
});
