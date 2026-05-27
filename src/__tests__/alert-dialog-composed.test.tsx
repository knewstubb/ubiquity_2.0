import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'

/**
 * Unit tests for AlertDialogComposed component.
 *
 * Validates: Requirements 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3
 */

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  intent: 'neutral' as const,
  title: 'Test title',
  confirmLabel: 'Confirm',
  onConfirm: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AlertDialogComposed', () => {
  it('renders title and body content per intent', () => {
    const { rerender } = render(
      <AlertDialogComposed {...defaultProps} intent="neutral">
        <p>Neutral body</p>
      </AlertDialogComposed>
    )
    expect(screen.getByText('Test title')).toBeInTheDocument()
    expect(screen.getByText('Neutral body')).toBeInTheDocument()

    rerender(
      <AlertDialogComposed {...defaultProps} intent="warning" title="Warning title">
        <p>Warning body</p>
      </AlertDialogComposed>
    )
    expect(screen.getByText('Warning title')).toBeInTheDocument()
    expect(screen.getByText('Warning body')).toBeInTheDocument()

    rerender(
      <AlertDialogComposed {...defaultProps} intent="destructive" title="Destructive title">
        <p>Destructive body</p>
      </AlertDialogComposed>
    )
    expect(screen.getByText('Destructive title')).toBeInTheDocument()
    expect(screen.getByText('Destructive body')).toBeInTheDocument()
  })

  it('neutral intent has no border accent', () => {
    render(
      <AlertDialogComposed {...defaultProps} intent="neutral">
        <p>Body</p>
      </AlertDialogComposed>
    )
    // Radix renders in a portal — query the document
    const content = document.querySelector('[role="alertdialog"]')
    expect(content).toBeInTheDocument()
    expect(content!.className).not.toContain('border-t-4')
    expect(content!.className).not.toContain('border-t-warning')
    expect(content!.className).not.toContain('border-t-destructive')
    // No border strip element for neutral
    const borderStrip = content!.querySelector('.bg-warning, .bg-destructive')
    expect(borderStrip).not.toBeInTheDocument()
  })

  it('warning intent shows amber border strip and icon', () => {
    render(
      <AlertDialogComposed {...defaultProps} intent="warning">
        <p>Body</p>
      </AlertDialogComposed>
    )
    const content = document.querySelector('[role="alertdialog"]')
    expect(content).toBeInTheDocument()

    // Border is a separate div element (full-width strip, no curve)
    const borderStrip = content!.querySelector('.bg-warning')
    expect(borderStrip).toBeInTheDocument()
    expect(borderStrip!.className).toContain('h-1')

    // Warning icon should be present (Phosphor Warning renders an SVG inside the title)
    const title = screen.getByText('Test title')
    const titleContainer = title.parentElement
    const svg = titleContainer?.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('destructive intent shows red border strip', () => {
    render(
      <AlertDialogComposed {...defaultProps} intent="destructive">
        <p>Body</p>
      </AlertDialogComposed>
    )
    const content = document.querySelector('[role="alertdialog"]')
    expect(content).toBeInTheDocument()

    // Border is a separate div element (full-width strip, no curve)
    const borderStrip = content!.querySelector('.bg-destructive')
    expect(borderStrip).toBeInTheDocument()
    expect(borderStrip!.className).toContain('h-1')
  })

  it('confirm button disabled when input required and empty', () => {
    render(
      <AlertDialogComposed
        {...defaultProps}
        intent="destructive"
        requiresInput="DELETE"
      >
        <p>Body</p>
      </AlertDialogComposed>
    )
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmBtn).toBeDisabled()
  })

  it('confirm button enabled when input matches', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialogComposed
        {...defaultProps}
        intent="destructive"
        requiresInput="DELETE"
      >
        <p>Body</p>
      </AlertDialogComposed>
    )
    const input = screen.getByRole('textbox')
    await user.type(input, 'DELETE')

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmBtn).not.toBeDisabled()
  })

  it('loading state shows spinner and disables buttons', async () => {
    let resolvePromise: () => void
    const asyncConfirm = () =>
      new Promise<void>((resolve) => {
        resolvePromise = resolve
      })

    render(
      <AlertDialogComposed
        {...defaultProps}
        onConfirm={asyncConfirm}
      >
        <p>Body</p>
      </AlertDialogComposed>
    )

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    // Spinner should be visible — query the document since Radix uses a portal
    const spinner = document.querySelector('[class*="animate-spin"]')
    expect(spinner).toBeInTheDocument()

    // Both buttons should be disabled
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelBtn).toBeDisabled()
    expect(confirmBtn).toBeDisabled()

    // Cleanup: resolve the promise
    await act(async () => {
      resolvePromise!()
    })
  })

  it('loading label shown during loading', async () => {
    let resolvePromise: () => void
    const asyncConfirm = () =>
      new Promise<void>((resolve) => {
        resolvePromise = resolve
      })

    render(
      <AlertDialogComposed
        {...defaultProps}
        onConfirm={asyncConfirm}
        loadingLabel="Processing..."
      >
        <p>Body</p>
      </AlertDialogComposed>
    )

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    // Loading label should be shown
    expect(screen.getByText('Processing...')).toBeInTheDocument()

    // Cleanup
    await act(async () => {
      resolvePromise!()
    })
  })

  it('input resets on close', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    const { rerender } = render(
      <AlertDialogComposed
        {...defaultProps}
        intent="destructive"
        requiresInput="DELETE"
        onOpenChange={onOpenChange}
      >
        <p>Body</p>
      </AlertDialogComposed>
    )

    // Type into the input
    const input = screen.getByRole('textbox')
    await user.type(input, 'DEL')
    expect(input).toHaveValue('DEL')

    // Close the dialog (set open to false)
    rerender(
      <AlertDialogComposed
        {...defaultProps}
        open={false}
        intent="destructive"
        requiresInput="DELETE"
        onOpenChange={onOpenChange}
      >
        <p>Body</p>
      </AlertDialogComposed>
    )

    // Re-open the dialog
    rerender(
      <AlertDialogComposed
        {...defaultProps}
        open={true}
        intent="destructive"
        requiresInput="DELETE"
        onOpenChange={onOpenChange}
      >
        <p>Body</p>
      </AlertDialogComposed>
    )

    // Input should be empty
    const newInput = screen.getByRole('textbox')
    expect(newInput).toHaveValue('')
  })

  it('cancel calls onCancel and onOpenChange', () => {
    const onCancel = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <AlertDialogComposed
        {...defaultProps}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      >
        <p>Body</p>
      </AlertDialogComposed>
    )

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('close X button calls onOpenChange(false)', () => {
    const onOpenChange = vi.fn()

    render(
      <AlertDialogComposed {...defaultProps} onOpenChange={onOpenChange}>
        <p>Body</p>
      </AlertDialogComposed>
    )

    const closeBtn = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeBtn)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('escape suppressed during loading', async () => {
    let resolvePromise: () => void
    const asyncConfirm = () =>
      new Promise<void>((resolve) => {
        resolvePromise = resolve
      })
    const onOpenChange = vi.fn()

    render(
      <AlertDialogComposed
        {...defaultProps}
        onConfirm={asyncConfirm}
        onOpenChange={onOpenChange}
      >
        <p>Body</p>
      </AlertDialogComposed>
    )

    // Trigger loading state
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    // Clear any calls from the click
    onOpenChange.mockClear()

    // Press Escape while loading — fire on document as Radix listens there
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    // onOpenChange should NOT have been called (escape is suppressed during loading)
    expect(onOpenChange).not.toHaveBeenCalled()

    // Cleanup
    await act(async () => {
      resolvePromise!()
    })
  })
})
