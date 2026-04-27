import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    connectorName: 'Daily Contact Export',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders the dialog with title and connector name in message', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete Automation')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete Daily Contact Export\?/)
    ).toBeInTheDocument();
  });

  it('renders Cancel and Delete buttons', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onConfirm when Delete button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop is clicked', async () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);
    const backdrop = screen.getByRole('dialog');
    await userEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not call onCancel when dialog content is clicked', async () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('Delete Automation'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('has correct aria attributes', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-modal-title');
  });
});
