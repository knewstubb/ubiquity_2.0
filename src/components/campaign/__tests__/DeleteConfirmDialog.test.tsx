import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    itemName: 'Summer Glow Campaign',
    itemType: 'campaign' as const,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('shows item name in the confirmation message', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(
      screen.getByText(/Are you sure you want to delete Summer Glow Campaign\?/),
    ).toBeInTheDocument();
  });

  it('shows "Delete Campaign" title for campaign type', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Delete Campaign')).toBeInTheDocument();
  });

  it('shows "Delete Journey" title for journey type', () => {
    render(<DeleteConfirmDialog {...defaultProps} itemType="journey" />);
    expect(screen.getByText('Delete Journey')).toBeInTheDocument();
  });

  it('calls onConfirm when Delete button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop is clicked', async () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onCancel={onCancel} />);
    const backdrop = screen.getByRole('dialog');
    await userEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('has correct aria attributes', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-confirm-title');
  });
});
