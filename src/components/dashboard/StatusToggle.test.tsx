import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StatusToggle } from './StatusToggle';

describe('StatusToggle', () => {
  it('renders Active label when active is true', () => {
    render(<StatusToggle active={true} onToggle={() => {}} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Paused label when active is false', () => {
    render(<StatusToggle active={false} onToggle={() => {}} />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('renders a checked toggle when active', () => {
    render(<StatusToggle active={true} onToggle={() => {}} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
  });

  it('renders an unchecked toggle when paused', () => {
    render(<StatusToggle active={false} onToggle={() => {}} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<StatusToggle active={true} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
