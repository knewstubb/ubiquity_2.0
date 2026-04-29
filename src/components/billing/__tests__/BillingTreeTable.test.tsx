import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BillingTreeTable } from '../BillingTreeTable';
import { PricingProvider } from '../../../contexts/PricingContext';
import type { AccountTreeNode } from '../useBillingReport';

/** Helper to build a minimal AccountTreeNode */
function makeNode(overrides: Partial<AccountTreeNode> & { id: string; name: string }): AccountTreeNode {
  return {
    account: {
      id: overrides.id,
      name: overrides.name,
      parentId: null,
      childIds: [],
      region: '',
      status: 'active',
    },
    level: overrides.level ?? 0,
    items: overrides.items ?? [],
    rolledUpTotal: overrides.rolledUpTotal ?? 0,
    children: overrides.children ?? [],
  };
}

const sampleLineItem = {
  id: 'item-1',
  accountId: 'acc-1',
  category: 'Mailouts' as const,
  description: 'Summer Campaign — Send 1',
  sendDate: '2025-06-15',
  items: 250,
  createdDate: '2025-06-10',
  user: 'Jane Doe',
};

const sampleLineItem2 = {
  id: 'item-2',
  accountId: 'acc-1-child',
  category: 'Integration' as const,
  description: 'Shopify — REST',
  sendDate: null,
  items: 100,
  createdDate: '2025-06-01',
  user: 'John Smith',
};

function buildSampleTree(): AccountTreeNode[] {
  const grandchild = makeNode({
    id: 'acc-1-grandchild',
    name: 'Sub Location A',
    level: 2,
    items: [sampleLineItem2],
    rolledUpTotal: 100,
  });

  const child = makeNode({
    id: 'acc-1-child',
    name: 'Child Account',
    level: 1,
    items: [],
    rolledUpTotal: 100,
    children: [grandchild],
  });

  const parent = makeNode({
    id: 'acc-1',
    name: 'Parent Account',
    level: 0,
    items: [sampleLineItem],
    rolledUpTotal: 350,
    children: [child],
  });

  return [parent];
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<PricingProvider>{ui}</PricingProvider>);
}

describe('BillingTreeTable', () => {
  const defaultProps = {
    sortColumn: 'account',
    sortDirection: 'asc' as const,
    onToggleSort: vi.fn(),
  };

  describe('empty state', () => {
    it('displays empty state message when tree is empty', () => {
      renderWithProviders(<BillingTreeTable tree={[]} {...defaultProps} />);
      expect(
        screen.getByText('No billing data found for the selected criteria.'),
      ).toBeInTheDocument();
    });

    it('does not render a table when tree is empty', () => {
      renderWithProviders(<BillingTreeTable tree={[]} {...defaultProps} />);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('expand/collapse toggling', () => {
    it('initially shows only parent account rows (collapsed)', () => {
      const tree = buildSampleTree();
      renderWithProviders(<BillingTreeTable tree={tree} {...defaultProps} />);

      // Parent should be visible
      expect(screen.getByText('Parent Account')).toBeInTheDocument();
      // Child should NOT be visible (collapsed)
      expect(screen.queryByText('Child Account')).not.toBeInTheDocument();
    });

    it('clicking a parent row expands to show children and line items', async () => {
      const user = userEvent.setup();
      const tree = buildSampleTree();
      renderWithProviders(<BillingTreeTable tree={tree} {...defaultProps} />);

      // Click parent to expand
      await user.click(screen.getByText('Parent Account'));

      // Child account and line item should now be visible
      expect(screen.getByText('Child Account')).toBeInTheDocument();
      expect(screen.getByText('Summer Campaign — Send 1')).toBeInTheDocument();
    });

    it('clicking an expanded parent row collapses it', async () => {
      const user = userEvent.setup();
      const tree = buildSampleTree();
      renderWithProviders(<BillingTreeTable tree={tree} {...defaultProps} />);

      // Expand
      await user.click(screen.getByText('Parent Account'));
      expect(screen.getByText('Child Account')).toBeInTheDocument();

      // Collapse
      await user.click(screen.getByText('Parent Account'));
      expect(screen.queryByText('Child Account')).not.toBeInTheDocument();
    });
  });

  describe('indentation levels', () => {
    it('renders level 0 (parent) with no indentation padding', async () => {
      const tree = buildSampleTree();
      renderWithProviders(<BillingTreeTable tree={tree} {...defaultProps} />);

      // Parent row should have paddingLeft: 0 (level 0 * 24 = 0)
      const parentCell = screen.getByText('Parent Account');
      const parentDiv = parentCell.closest('div');
      expect(parentDiv).toHaveStyle({ paddingLeft: '0px' });
    });

    it('renders level 1 (child) with 24px indentation', async () => {
      const user = userEvent.setup();
      const tree = buildSampleTree();
      renderWithProviders(<BillingTreeTable tree={tree} {...defaultProps} />);

      // Expand parent
      await user.click(screen.getByText('Parent Account'));

      const childCell = screen.getByText('Child Account');
      const childDiv = childCell.closest('div');
      expect(childDiv).toHaveStyle({ paddingLeft: '24px' });
    });

    it('renders level 2 (grandchild) with 48px indentation', async () => {
      const user = userEvent.setup();
      const tree = buildSampleTree();
      renderWithProviders(<BillingTreeTable tree={tree} {...defaultProps} />);

      // Expand parent, then child
      await user.click(screen.getByText('Parent Account'));
      await user.click(screen.getByText('Child Account'));

      const grandchildCell = screen.getByText('Sub Location A');
      const grandchildDiv = grandchildCell.closest('div');
      expect(grandchildDiv).toHaveStyle({ paddingLeft: '48px' });
    });
  });

  describe('sort arrow indicator', () => {
    it('shows ▲ arrow on active sort column in ascending direction', () => {
      const tree = buildSampleTree();
      renderWithProviders(
        <BillingTreeTable
          tree={tree}
          sortColumn="account"
          sortDirection="asc"
          onToggleSort={vi.fn()}
        />,
      );

      expect(screen.getByText('▲')).toBeInTheDocument();
    });

    it('shows ▼ arrow on active sort column in descending direction', () => {
      const tree = buildSampleTree();
      renderWithProviders(
        <BillingTreeTable
          tree={tree}
          sortColumn="account"
          sortDirection="desc"
          onToggleSort={vi.fn()}
        />,
      );

      expect(screen.getByText('▼')).toBeInTheDocument();
    });

    it('does not show arrow on non-active sort columns', () => {
      const tree = buildSampleTree();
      renderWithProviders(
        <BillingTreeTable
          tree={tree}
          sortColumn="account"
          sortDirection="asc"
          onToggleSort={vi.fn()}
        />,
      );

      // The arrow should only appear once (on the active column)
      const arrows = screen.queryAllByText(/[▲▼]/);
      expect(arrows.length).toBe(1);
    });

    it('calls onToggleSort when a column header is clicked', async () => {
      const user = userEvent.setup();
      const onToggleSort = vi.fn();
      const tree = buildSampleTree();
      renderWithProviders(
        <BillingTreeTable
          tree={tree}
          sortColumn="account"
          sortDirection="asc"
          onToggleSort={onToggleSort}
        />,
      );

      await user.click(screen.getByText('Items'));
      expect(onToggleSort).toHaveBeenCalledWith('items');
    });
  });
});
