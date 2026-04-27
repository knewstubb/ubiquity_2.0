import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WizardNavButtons } from './WizardNavButtons';

function renderNav(overrides: Partial<{
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLast: boolean;
  showBack: boolean;
}> = {}) {
  const props = {
    onBack: overrides.onBack ?? vi.fn(),
    onNext: overrides.onNext ?? vi.fn(),
    canProceed: overrides.canProceed ?? true,
    isLast: overrides.isLast ?? false,
    showBack: overrides.showBack,
  };
  return { ...render(<WizardNavButtons {...props} />), ...props };
}

describe('WizardNavButtons', () => {
  it('renders Back and Next buttons by default', () => {
    renderNav();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('hides Back button when showBack is false', () => {
    renderNav({ showBack: false });
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('shows "Save" label on the final step', () => {
    renderNav({ isLast: true });
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('disables Next when canProceed is false', () => {
    renderNav({ canProceed: false });
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next when canProceed is true', () => {
    renderNav({ canProceed: true });
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('calls onNext when Next is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderNav({ onNext });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderNav({ onBack });
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('does not call onNext when disabled', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderNav({ onNext, canProceed: false });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onNext).not.toHaveBeenCalled();
  });

  it('disables Save button when canProceed is false on last step', () => {
    renderNav({ isLast: true, canProceed: false });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
