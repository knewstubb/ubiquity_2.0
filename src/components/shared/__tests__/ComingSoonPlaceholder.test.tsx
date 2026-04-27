import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>{children}</a>
  ),
}));

import { ComingSoonPlaceholder } from '../ComingSoonPlaceholder';

describe('ComingSoonPlaceholder', () => {
  it('renders the "Coming Soon" heading', () => {
    render(<ComingSoonPlaceholder />);
    expect(screen.getByRole('heading', { name: /coming soon/i })).toBeInTheDocument();
  });

  it('renders a message indicating the feature is not yet available', () => {
    render(<ComingSoonPlaceholder />);
    expect(screen.getByText(/not yet available/i)).toBeInTheDocument();
  });

  it('renders a link back to the dashboard', () => {
    render(<ComingSoonPlaceholder />);
    const link = screen.getByRole('link', { name: /back to dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
