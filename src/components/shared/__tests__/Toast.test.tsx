import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '../Toast';

// Helper component that exposes showToast via a button
function ToastTrigger({ message, type }: { message: string; type?: 'success' | 'error' | 'info' | 'warning' }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, type)}>Show Toast</button>;
}

describe('Toast', () => {
  it('renders a toast message when showToast is called', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Hello toast" />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Hello toast')).toBeInTheDocument();
  });

  it('can be manually dismissed via the dismiss button', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Dismissable" />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Dismissable')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Dismissable')).not.toBeInTheDocument();
  });

  it('renders multiple toasts simultaneously', async () => {
    function MultiTrigger() {
      const { showToast } = useToast();
      return (
        <>
          <button onClick={() => showToast('Toast A')}>Trigger A</button>
          <button onClick={() => showToast('Toast B')}>Trigger B</button>
        </>
      );
    }

    const user = userEvent.setup();
    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Trigger A'));
    await user.click(screen.getByText('Trigger B'));

    expect(screen.getByText('Toast A')).toBeInTheDocument();
    expect(screen.getByText('Toast B')).toBeInTheDocument();
  });

  it('applies the correct type class', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Error toast" type="error" />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));
    const toastEl = screen.getByText('Error toast').closest('div');
    expect(toastEl?.className).toContain('error');
  });

  it('has an accessible status container', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Accessible" />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('throws when useToast is used outside ToastProvider', () => {
    function Orphan() {
      useToast();
      return null;
    }

    expect(() => render(<Orphan />)).toThrow(
      /useToast must be used within a ToastProvider/,
    );
  });

  describe('auto-dismiss', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('auto-dismisses after 5 seconds', () => {
      // Directly invoke showToast via a ref-based approach
      let triggerToast: (msg: string) => void;

      function Capture() {
        const { showToast } = useToast();
        triggerToast = showToast;
        return null;
      }

      render(
        <ToastProvider>
          <Capture />
        </ToastProvider>,
      );

      act(() => {
        triggerToast!('Temporary');
      });

      expect(screen.getByText('Temporary')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText('Temporary')).not.toBeInTheDocument();
    });
  });
});
