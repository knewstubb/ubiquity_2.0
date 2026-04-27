import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { OverflowMenu } from './OverflowMenu';

const defaultItems = [
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Delete', onClick: vi.fn(), danger: true },
];

describe('OverflowMenu', () => {
  it('renders the trigger button', () => {
    render(<OverflowMenu items={defaultItems} />);
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
  });

  it('does not show menu items initially', () => {
    render(<OverflowMenu items={defaultItems} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows menu items when trigger is clicked', async () => {
    render(<OverflowMenu items={defaultItems} />);
    await userEvent.click(screen.getByLabelText('More actions'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls item onClick and closes menu when an item is clicked', async () => {
    const onEdit = vi.fn();
    const items = [
      { label: 'Edit', onClick: onEdit },
      { label: 'Delete', onClick: vi.fn(), danger: true },
    ];
    render(<OverflowMenu items={items} />);
    await userEvent.click(screen.getByLabelText('More actions'));
    await userEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu when clicking outside', async () => {
    render(
      <div>
        <span data-testid="outside">outside</span>
        <OverflowMenu items={defaultItems} />
      </div>
    );
    await userEvent.click(screen.getByLabelText('More actions'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('sets aria-expanded correctly', async () => {
    render(<OverflowMenu items={defaultItems} />);
    const trigger = screen.getByLabelText('More actions');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
