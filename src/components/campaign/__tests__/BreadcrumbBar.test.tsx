import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { BreadcrumbBar } from '../BreadcrumbBar';

function renderBar(items: { label: string; to?: string }[]) {
  return render(
    <MemoryRouter>
      <BreadcrumbBar items={items} />
    </MemoryRouter>,
  );
}

describe('BreadcrumbBar', () => {
  it('renders all item labels', () => {
    renderBar([
      { label: 'Campaigns', to: '/automations/campaigns' },
      { label: 'Summer Glow' },
    ]);
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Summer Glow')).toBeInTheDocument();
  });

  it('renders ">" separators between items', () => {
    renderBar([
      { label: 'Campaigns', to: '/automations/campaigns' },
      { label: 'Summer Glow' },
    ]);
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('renders items with "to" prop as links', () => {
    renderBar([
      { label: 'Campaigns', to: '/automations/campaigns' },
      { label: 'Summer Glow' },
    ]);
    const link = screen.getByRole('link', { name: 'Campaigns' });
    expect(link).toHaveAttribute('href', '/automations/campaigns');
  });

  it('renders last item as plain text, not a link', () => {
    renderBar([
      { label: 'Campaigns', to: '/automations/campaigns' },
      { label: 'Summer Glow' },
    ]);
    expect(screen.queryByRole('link', { name: 'Summer Glow' })).not.toBeInTheDocument();
    expect(screen.getByText('Summer Glow')).toBeInTheDocument();
  });

  it('marks the last item with aria-current="page"', () => {
    renderBar([
      { label: 'Campaigns', to: '/automations/campaigns' },
      { label: 'Summer Glow' },
    ]);
    expect(screen.getByText('Summer Glow')).toHaveAttribute('aria-current', 'page');
  });

  it('renders a nav element with aria-label', () => {
    renderBar([{ label: 'Home' }]);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });
});
