import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DeleteConfirmDialog } from '../DeleteConfirmDialog'

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    itemName: 'Summer Glow Campaign',
    itemType: 'campaign' as const,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('shows item name in the confirmation message', () => {
    render(<DeleteConfirmDialog {...defaultProps} />)
    // The item name appears in both title and body
    const matches = screen.getAllByText(/Summer Glow Campaign/)
    expect(matches.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/permanently delete/)).toBeInTheDocument()
    // "cannot be undone" appears in body and checkbox label
    const undoneMatches = screen.getAllByText(/cannot be undone/)
    expect(undoneMatches.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Delete campaign" title for campaign type', () => {
    render(<DeleteConfirmDialog {...defaultProps} />)
    expect(screen.getByText("Delete 'Summer Glow Campaign'?")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete campaign' })).toBeInTheDocument()
  })

  it('shows "Delete journey" title for journey type', () => {
    render(<DeleteConfirmDialog {...defaultProps} itemType="journey" />)
    expect(screen.getByRole('button', { name: 'Delete journey' })).toBeInTheDocument()
  })

  it('calls onConfirm when Delete button is clicked', async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    // Check the confirmation checkbox first (required for destructive intent)
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete campaign' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmDialog {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('has correct aria role', () => {
    render(<DeleteConfirmDialog {...defaultProps} />)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
  })

  it('renders with destructive intent styling', () => {
    render(<DeleteConfirmDialog {...defaultProps} />)
    const dialog = screen.getByRole('alertdialog')
    // Border is a separate div strip element inside the dialog
    const borderStrip = dialog.querySelector('.bg-destructive')
    expect(borderStrip).toBeInTheDocument()
  })

  it('supports controlled open state', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <DeleteConfirmDialog {...defaultProps} open={true} onOpenChange={onOpenChange} />,
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    rerender(
      <DeleteConfirmDialog {...defaultProps} open={false} onOpenChange={onOpenChange} />,
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
