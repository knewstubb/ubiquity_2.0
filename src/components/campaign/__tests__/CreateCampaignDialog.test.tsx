import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CreateCampaignDialog } from '../CreateCampaignDialog';

describe('CreateCampaignDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onCreate: vi.fn(),
  };

  it('renders the dialog when open is true', () => {
    render(<CreateCampaignDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create Campaign')).toBeInTheDocument();
  });

  it('renders nothing when open is false', () => {
    const { container } = render(<CreateCampaignDialog {...defaultProps} open={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('disables Create button when name is empty', () => {
    render(<CreateCampaignDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('enables Create button when name is entered', async () => {
    const user = userEvent.setup();
    render(<CreateCampaignDialog {...defaultProps} />);
    await user.type(screen.getByLabelText(/Campaign Name/), 'My Campaign');
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('calls onCreate with name and goal on submit', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateCampaignDialog {...defaultProps} onCreate={onCreate} />);

    await user.type(screen.getByLabelText(/Campaign Name/), 'Holiday Sale');
    await user.type(screen.getByLabelText(/Goal/), 'Boost revenue');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(onCreate).toHaveBeenCalledWith('Holiday Sale', 'Boost revenue');
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CreateCampaignDialog {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
