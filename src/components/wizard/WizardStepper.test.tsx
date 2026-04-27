import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WizardStepper } from './WizardStepper';

const defaultSteps = [
  { label: 'Data Source Selection' },
  { label: 'Field Mapping' },
  { label: 'Output Configuration' },
  { label: 'Review' },
];

function renderStepper(overrides: {
  currentStep?: number;
  completedSteps?: number[];
  onStepClick?: (i: number) => void;
} = {}) {
  const props = {
    steps: defaultSteps,
    currentStep: overrides.currentStep ?? 0,
    completedSteps: overrides.completedSteps ?? [],
    onStepClick: overrides.onStepClick ?? vi.fn(),
  };
  return { ...render(<WizardStepper {...props} />), onStepClick: props.onStepClick };
}

describe('WizardStepper', () => {
  it('renders all four step labels', () => {
    renderStepper();
    for (const step of defaultSteps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });

  it('renders numbered circles for non-completed steps', () => {
    renderStepper({ currentStep: 0 });
    // Steps 2-4 should show their numbers
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('marks the current step with aria-current="step"', () => {
    renderStepper({ currentStep: 2 });
    const currentStepEl = screen.getByText('Output Configuration').closest('[aria-current]');
    expect(currentStepEl).toHaveAttribute('aria-current', 'step');
  });

  it('does not set aria-current on non-current steps', () => {
    renderStepper({ currentStep: 0 });
    const otherStep = screen.getByText('Field Mapping').closest('div');
    expect(otherStep).not.toHaveAttribute('aria-current');
  });

  it('renders a checkmark for completed steps (not current)', () => {
    renderStepper({ currentStep: 2, completedSteps: [0, 1] });
    // Completed steps should not show their number
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    // Current step shows its number
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('makes completed (non-current) steps clickable', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    renderStepper({ currentStep: 2, completedSteps: [0, 1], onStepClick });

    const step0 = screen.getByText('Data Source Selection').closest('[role="button"]');
    expect(step0).toBeInTheDocument();
    await user.click(step0!);
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('does not make future steps clickable', () => {
    renderStepper({ currentStep: 1, completedSteps: [0] });
    const futureStep = screen.getByText('Output Configuration').closest('div');
    expect(futureStep).not.toHaveAttribute('role', 'button');
  });

  it('does not make the current step clickable even if completed', () => {
    renderStepper({ currentStep: 1, completedSteps: [0, 1] });
    const currentStep = screen.getByText('Field Mapping').closest('[aria-current]');
    expect(currentStep).not.toHaveAttribute('role', 'button');
  });

  it('does not fire onStepClick for future steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    renderStepper({ currentStep: 0, completedSteps: [], onStepClick });

    await user.click(screen.getByText('Review'));
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation on completed steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    renderStepper({ currentStep: 3, completedSteps: [0, 1, 2], onStepClick });

    const step1 = screen.getByText('Field Mapping').closest('[role="button"]');
    step1!.focus();
    await user.keyboard('{Enter}');
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('renders a nav element with aria-label', () => {
    renderStepper();
    const nav = screen.getByRole('navigation', { name: 'Wizard progress' });
    expect(nav).toBeInTheDocument();
  });
});
