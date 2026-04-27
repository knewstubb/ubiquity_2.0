import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CreateJourneyDialog } from '../CreateJourneyDialog';

describe('CreateJourneyDialog', () => {
  const defaultProps = {
    open: true,
    campaignId: 'cmp-1',
    onClose: vi.fn(),
    onCreate: vi.fn(),
  };

  it('renders the dialog when open is true', () => {
    render(<CreateJourneyDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create Journey')).toBeInTheDocument();
  });

  it('renders nothing when open is false', () => {
    const { container } = render(<CreateJourneyDialog {...defaultProps} open={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('disables Create button when name is empty', () => {
    render(<CreateJourneyDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('enables Create button when name is entered', async () => {
    const user = userEvent.setup();
    render(<CreateJourneyDialog {...defaultProps} />);
    await user.type(screen.getByLabelText(/Journey Name/), 'Welcome Flow');
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('calls onCreate with name and type on submit', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateJourneyDialog {...defaultProps} onCreate={onCreate} />);

    await user.type(screen.getByLabelText(/Journey Name/), 'Welcome Flow');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(onCreate).toHaveBeenCalledWith('Welcome Flow', 'welcome');
  });

  it('defaults type dropdown to welcome', () => {
    render(<CreateJourneyDialog {...defaultProps} />);
    const select = screen.getByLabelText(/Journey Type/) as HTMLSelectElement;
    expect(select.value).toBe('welcome');
  });

  it('calls onCreate with selected type', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateJourneyDialog {...defaultProps} onCreate={onCreate} />);

    await user.type(screen.getByLabelText(/Journey Name/), 'Promo Blast');
    await user.selectOptions(screen.getByLabelText(/Journey Type/), 'promotional');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(onCreate).toHaveBeenCalledWith('Promo Blast', 'promotional');
  });

  it('does not render a campaign selector', () => {
    render(<CreateJourneyDialog {...defaultProps} />);
    expect(screen.queryByLabelText(/campaign/i)).not.toBeInTheDocument();
  });
});
