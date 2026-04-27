import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state ---
const { mockChangelogCtx } = vi.hoisted(() => ({
  mockChangelogCtx: {
    entries: [] as Array<{ id: string; title: string; description: string; affectedRoutes: string[]; createdAt: string }>,
    unseenEntries: [],
    dismissBanner: vi.fn(),
    showBanner: false,
  },
}));

vi.mock('../../../contexts/ChangelogContext', () => ({
  useChangelog: () => mockChangelogCtx,
}));

import { WhatsNewPanel } from '../WhatsNewPanel';

describe('WhatsNewPanel', () => {
  beforeEach(() => {
    mockChangelogCtx.entries = [];
  });

  it('renders the "What\'s New" trigger button', () => {
    render(<WhatsNewPanel />);
    expect(screen.getByRole('button', { name: /what's new/i })).toBeInTheDocument();
  });

  it('opens the panel when the trigger button is clicked', async () => {
    const user = userEvent.setup();
    render(<WhatsNewPanel />);

    await user.click(screen.getByRole('button', { name: /what's new/i }));

    expect(screen.getByRole('dialog', { name: /what's new/i })).toBeInTheDocument();
  });

  it('shows empty state when there are no entries', async () => {
    mockChangelogCtx.entries = [];
    const user = userEvent.setup();
    render(<WhatsNewPanel />);

    await user.click(screen.getByRole('button', { name: /what's new/i }));

    expect(screen.getByText(/no changelog entries yet/i)).toBeInTheDocument();
  });

  it('renders changelog entries when present', async () => {
    mockChangelogCtx.entries = [
      { id: '1', title: 'New Feature', description: 'Added campaigns', affectedRoutes: ['/campaigns'], createdAt: '2024-01-15T00:00:00Z' },
      { id: '2', title: 'Bug Fix', description: '', affectedRoutes: [], createdAt: '2024-01-10T00:00:00Z' },
    ];
    const user = userEvent.setup();
    render(<WhatsNewPanel />);

    await user.click(screen.getByRole('button', { name: /what's new/i }));

    expect(screen.getByText('New Feature')).toBeInTheDocument();
    expect(screen.getByText('Bug Fix')).toBeInTheDocument();
    expect(screen.getByText('Added campaigns')).toBeInTheDocument();
    expect(screen.getByText('/campaigns')).toBeInTheDocument();
  });

  it('closes the panel when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<WhatsNewPanel />);

    await user.click(screen.getByRole('button', { name: /what's new/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close panel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the panel when the overlay is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<WhatsNewPanel />);

    await user.click(screen.getByRole('button', { name: /what's new/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // The overlay is the sibling div before the panel
    const overlay = container.querySelector('[class*="overlay"]');
    expect(overlay).toBeTruthy();
    await user.click(overlay!);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
