import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { JourneyCard } from '../JourneyCard';
import type { Journey } from '../../../models/campaign';

const mockJourney: Journey = {
  id: 'jrn-1',
  name: 'Welcome Flow',
  campaignId: 'cmp-1',
  accountId: 'acc-master',
  status: 'active',
  nodeCount: 6,
  entryCount: 42,
  type: 'welcome',
};

const defaultProps = {
  journey: mockJourney,
  onRename: vi.fn(),
  onDelete: vi.fn(),
  onClick: vi.fn(),
};

describe('JourneyCard', () => {
  it('renders journey name', () => {
    render(<JourneyCard {...defaultProps} />);
    expect(screen.getByText('Welcome Flow')).toBeInTheDocument();
  });

  it('renders type label', () => {
    render(<JourneyCard {...defaultProps} />);
    expect(screen.getByText('welcome')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<JourneyCard {...defaultProps} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders entry count', () => {
    render(<JourneyCard {...defaultProps} />);
    expect(screen.getByText('42 entries')).toBeInTheDocument();
  });

  it('renders singular entry count', () => {
    render(<JourneyCard {...defaultProps} journey={{ ...mockJourney, entryCount: 1 }} />);
    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  it('renders campaign name subtitle when provided', () => {
    render(<JourneyCard {...defaultProps} campaignName="Summer Glow" />);
    expect(screen.getByText('Summer Glow')).toBeInTheDocument();
  });

  it('does not render campaign name when not provided', () => {
    render(<JourneyCard {...defaultProps} />);
    expect(screen.queryByText('Summer Glow')).not.toBeInTheDocument();
  });

  it('calls onClick with journey id when card is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<JourneyCard {...defaultProps} onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: /Journey: Welcome Flow/ }));
    expect(onClick).toHaveBeenCalledWith('jrn-1');
  });

  it('opens overflow menu with Rename and Delete options', async () => {
    const user = userEvent.setup();
    render(<JourneyCard {...defaultProps} />);
    await user.click(screen.getByLabelText('More actions'));
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders correct icon for re-engagement type', () => {
    const reEngJourney: Journey = { ...mockJourney, type: 're-engagement' };
    render(<JourneyCard {...defaultProps} journey={reEngJourney} />);
    expect(screen.getByText('re-engagement')).toBeInTheDocument();
  });

  it('renders correct icon for transactional type', () => {
    const txnJourney: Journey = { ...mockJourney, type: 'transactional' };
    render(<JourneyCard {...defaultProps} journey={txnJourney} />);
    expect(screen.getByText('transactional')).toBeInTheDocument();
  });

  it('renders correct icon for promotional type', () => {
    const promoJourney: Journey = { ...mockJourney, type: 'promotional' };
    render(<JourneyCard {...defaultProps} journey={promoJourney} />);
    expect(screen.getByText('promotional')).toBeInTheDocument();
  });
});
