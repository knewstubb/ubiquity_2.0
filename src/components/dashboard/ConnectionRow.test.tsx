import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ConnectionRow } from './ConnectionRow';
import type { Connection } from '../../models/connection';
import type { Connector } from '../../models/connector';

const mockConnection: Connection = {
  id: 'conn-1',
  name: 'Spa AWS S3 Bucket',
  protocol: 'S3',
  status: 'connected',
  config: { region: 'us-east-1', bucket: 'spa-exports', prefix: 'data/' },
};

const mockConnectors: Connector[] = [
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

function renderRow(connectors = mockConnectors, children?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <ConnectionRow
        connection={mockConnection}
        connectors={connectors}
        onAddConnector={mockOnAddConnector}
      >
        {children ?? <div data-testid="child-content">Connector cards here</div>}
      </ConnectionRow>
    </MemoryRouter>,
  );
}

describe('ConnectionRow', () => {
  beforeEach(() => {
    mockOnAddConnector.mockClear();
  });

  it('renders connection name and protocol icon', () => {
    renderRow();
    expect(screen.getByText('Spa AWS S3 Bucket')).toBeInTheDocument();
    expect(screen.getByLabelText('S3 bucket')).toBeInTheDocument();
  });

  it('renders connector count', () => {
    renderRow();
    expect(screen.getByText('1 of 2 Automations Active')).toBeInTheDocument();
  });

  it('renders singular connector count', () => {
    renderRow([mockConnectors[0]]);
    expect(screen.getByText('1 of 1 Automations Active')).toBeInTheDocument();
  });

  it('renders "+ Add Automation" button that calls onAddConnector', async () => {
    const user = userEvent.setup();
    renderRow();
    const addButton = screen.getByText('+ Add Automation');
    expect(addButton).toBeInTheDocument();
    expect(addButton.tagName).toBe('BUTTON');

    await user.click(addButton);
    expect(mockOnAddConnector).toHaveBeenCalledWith('conn-1');
  });

  it('defaults to collapsed state — children not visible', () => {
    renderRow();
    const header = screen.getByRole('button', { name: /spa aws s3 bucket/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands on click to show children', async () => {
    const user = userEvent.setup();
    renderRow();

    const header = screen.getByRole('button', { name: /spa aws s3 bucket/i });
    await user.click(header);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('collapses on second click to hide children', async () => {
    const user = userEvent.setup();
    renderRow();

    const header = screen.getByRole('button', { name: /spa aws s3 bucket/i });
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');

    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded correctly', async () => {
    const user = userEvent.setup();
    renderRow();

    const header = screen.getByRole('button', { name: /spa aws s3 bucket/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows status dot for connected status', () => {
    renderRow();
    const dot = screen.getByTitle('Connected');
    expect(dot).toBeInTheDocument();
  });

  it('shows status dot for error status', () => {
    const errorConnection: Connection = {
      ...mockConnection,
      status: 'error',
    };
    render(
      <MemoryRouter>
        <ConnectionRow connection={errorConnection} connectors={[]} onAddConnector={mockOnAddConnector}>
          <div />
        </ConnectionRow>
      </MemoryRouter>,
    );
    expect(screen.getByTitle('Error')).toBeInTheDocument();
  });

  it('toggles via keyboard (Enter key)', async () => {
    const user = userEvent.setup();
    renderRow();

    const header = screen.getByRole('button', { name: /spa aws s3 bucket/i });
    header.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('does not expand when clicking "+ Add Automation"', async () => {
    const user = userEvent.setup();
    renderRow();

    const addButton = screen.getByText('+ Add Automation');
    await user.click(addButton);

    const header = screen.getByRole('button', { name: /spa aws s3 bucket/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });
});
