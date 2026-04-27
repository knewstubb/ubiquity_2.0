import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CampaignFolderCard } from '../CampaignFolderCard';
import type { Campaign } from '../../../models/campaign';

const mockCampaign: Campaign = {
  id: 'cmp-1',
  name: 'Summer Glow Campaign',
  accountId: 'acc-master',
  goal: 'Drive summer bookings',
  dateRange: { start: '2024-11-15', end: '2025-02-28' },
  status: 'active',
  journeyIds: ['j1', 'j2', 'j3'],
  tags: ['seasonal'],
};

const defaultProps = {
  campaign: mockCampaign,
  journeyCount: 3,
  onRename: vi.fn(),
  onDelete: vi.fn(),
  onClick: vi.fn(),
};

describe('CampaignFolderCard', () => {
  it('renders campaign name', () => {
    render(<CampaignFolderCard {...defaultProps} />);
    expect(screen.getByText('Summer Glow Campaign')).toBeInTheDocument();
  });

  it('renders journey count label', () => {
    render(<CampaignFolderCard {...defaultProps} />);
    expect(screen.getByText('3 journeys')).toBeInTheDocument();
  });

  it('renders singular journey count', () => {
    render(<CampaignFolderCard {...defaultProps} journeyCount={1} />);
    expect(screen.getByText('1 journey')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<CampaignFolderCard {...defaultProps} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders folder icon', () => {
    render(<CampaignFolderCard {...defaultProps} />);
    expect(screen.getByLabelText('Campaign: Summer Glow Campaign')).toBeInTheDocument();
  });

  it('calls onClick with campaign id when card is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<CampaignFolderCard {...defaultProps} onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: /Campaign: Summer Glow Campaign/ }));
    expect(onClick).toHaveBeenCalledWith('cmp-1');
  });

  it('opens overflow menu with Rename and Delete options', async () => {
    const user = userEvent.setup();
    render(<CampaignFolderCard {...defaultProps} />);
    await user.click(screen.getByLabelText('More actions'));
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows inline rename input pre-filled with current name when Rename is clicked', async () => {
    const user = userEvent.setup();
    render(<CampaignFolderCard {...defaultProps} />);
    await user.click(screen.getByLabelText('More actions'));
    await user.click(screen.getByText('Rename'));
    const input = screen.getByLabelText('Rename campaign') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Summer Glow Campaign');
  });

  it('confirms rename on Enter key', async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    render(<CampaignFolderCard {...defaultProps} onRename={onRename} />);

    await user.click(screen.getByLabelText('More actions'));
    await user.click(screen.getByText('Rename'));

    const input = screen.getByLabelText('Rename campaign');
    await user.clear(input);
    await user.type(input, 'Winter Campaign{Enter}');

    expect(onRename).toHaveBeenCalledWith('cmp-1', 'Winter Campaign');
  });

  it('cancels rename on Escape key', async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    render(<CampaignFolderCard {...defaultProps} onRename={onRename} />);

    await user.click(screen.getByLabelText('More actions'));
    await user.click(screen.getByText('Rename'));

    const input = screen.getByLabelText('Rename campaign');
    await user.clear(input);
    await user.type(input, 'Something else{Escape}');

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText('Summer Glow Campaign')).toBeInTheDocument();
  });

  it('calls onDelete with campaign id when Delete is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<CampaignFolderCard {...defaultProps} onDelete={onDelete} />);
    await user.click(screen.getByLabelText('More actions'));
    await user.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('cmp-1');
  });
});
