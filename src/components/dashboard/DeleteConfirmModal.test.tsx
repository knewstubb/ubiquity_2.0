import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    objectType: 'Automation',
    objectName: 'Daily Contact Export',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders the dialog with title including object type', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete Automation?')).toBeInTheDocument();
  });

  it('renders the object name in the message', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText('Daily Contact Export')).toBeInTheDocument();
  });

  it('renders Cancel and Delete buttons', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Automation' })).toBeInTheDocument();
  });

  it('delete button is disabled until ACCEPT is typed', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    const deleteBtn = screen.getByRole('button', { name: 'Delete Automation' });
    expect(deleteBtn).toBeDisabled();
  });

  it('delete button is enabled after typing ACCEPT', async () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('ACCEPT');
    await userEvent.type(input, 'ACCEPT');
    const deleteBtn = screen.getByRole('button', { name: 'Delete Automation' });
    expect(deleteBtn).toBeEnabled();
  });

  it('calls onConfirm when ACCEPT is typed and Delete is clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    const input = screen.getByPlaceholderText('ACCEPT');
    await userEvent.type(input, 'ACCEPT');
    await userEvent.click(screen.getByRole('button', { name: 'Delete Automation' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('accepts lowercase "accept"', async () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    const input = screen.getByPlaceholderText('ACCEPT');
    await userEvent.type(input, 'accept');
    await userEvent.click(screen.getByRole('button', { name: 'Delete Automation' }));
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

  it('works for Connection type', () => {
    render(<DeleteConfirmModal {...defaultProps} objectType="Connection" objectName="Spa SFTP Server" />);
    expect(screen.getByText('Delete Connection?')).toBeInTheDocument();
    expect(screen.getByText('Spa SFTP Server')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Connection' })).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-modal-title');
  });
});
