import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationsStep } from './NotificationsStep'
import type { ExporterNotificationConfig } from '../../models/wizard'

/**
 * Unit tests for the shared NotificationsStep component.
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.7, 10.8
 */

function createDefaultConfig(overrides?: Partial<ExporterNotificationConfig>): ExporterNotificationConfig {
  return {
    failureEmails: [],
    successEnabled: false,
    successEmails: [],
    noFileAlertEnabled: false,
    noFileAlertEmails: [],
    ...overrides,
  }
}

describe('NotificationsStep', () => {
  describe('Failure section (always visible, required)', () => {
    it('renders the Failure section heading with required indicator', () => {
      const onUpdate = vi.fn()
      render(<NotificationsStep value={createDefaultConfig()} onUpdate={onUpdate} />)

      expect(screen.getByText('Failure')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders the failure email chip input', () => {
      const onUpdate = vi.fn()
      render(<NotificationsStep value={createDefaultConfig()} onUpdate={onUpdate} />)

      // The failure section has a ChipInput with placeholder
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(1)
    })

    it('displays existing failure emails as chips', () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ failureEmails: ['alice@test.com', 'bob@test.com'] })}
          onUpdate={onUpdate}
        />
      )

      expect(screen.getByText('alice@test.com')).toBeInTheDocument()
      expect(screen.getByText('bob@test.com')).toBeInTheDocument()
    })
  })

  describe('Success section (toggle + email input)', () => {
    it('renders the Success section heading', () => {
      const onUpdate = vi.fn()
      render(<NotificationsStep value={createDefaultConfig()} onUpdate={onUpdate} />)

      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('renders the success toggle switch', () => {
      const onUpdate = vi.fn()
      render(<NotificationsStep value={createDefaultConfig()} onUpdate={onUpdate} />)

      // Both success and no-file sections have an "Enable" switch
      const switches = screen.getAllByRole('switch')
      expect(switches.length).toBe(2)
      // First switch is the success toggle
      expect(switches[0]).toHaveAttribute('id', 'toggle-success-enable')
    })

    it('does not show success email input when toggle is off', () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ successEnabled: false })}
          onUpdate={onUpdate}
        />
      )

      // Only the failure email input should be visible (no "copy from above" link)
      expect(screen.queryByText('copy from above')).not.toBeInTheDocument()
    })

    it('shows success email input when toggle is on', () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ successEnabled: true })}
          onUpdate={onUpdate}
        />
      )

      // "copy from above" link appears in the success section
      expect(screen.getByText('copy from above')).toBeInTheDocument()
    })
  })

  describe('No File section (toggle + schedule)', () => {
    it('renders the No File section heading', () => {
      const onUpdate = vi.fn()
      render(<NotificationsStep value={createDefaultConfig()} onUpdate={onUpdate} />)

      expect(screen.getByText('No File')).toBeInTheDocument()
    })

    it('does not show schedule config when no-file toggle is off', () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ noFileAlertEnabled: false })}
          onUpdate={onUpdate}
        />
      )

      // Schedule-related elements should not be visible
      expect(screen.queryByText('Hourly')).not.toBeInTheDocument()
      expect(screen.queryByText('Starting')).not.toBeInTheDocument()
    })

    it('shows schedule config when no-file toggle is on', () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ noFileAlertEnabled: true })}
          onUpdate={onUpdate}
        />
      )

      // Frequency options should be visible
      expect(screen.getByText('Hourly')).toBeInTheDocument()
      expect(screen.getByText('Daily')).toBeInTheDocument()
      expect(screen.getByText('Weekly')).toBeInTheDocument()
      expect(screen.getByText('Monthly')).toBeInTheDocument()
      // Schedule fields
      expect(screen.getByText('Starting')).toBeInTheDocument()
      expect(screen.getByText('Every')).toBeInTheDocument()
      expect(screen.getByText('At')).toBeInTheDocument()
    })
  })

  describe('Validity reporting via onValidChange', () => {
    it('reports invalid (false) when failureEmails is empty', () => {
      const onValidChange = vi.fn()
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ failureEmails: [] })}
          onUpdate={onUpdate}
          onValidChange={onValidChange}
        />
      )

      expect(onValidChange).toHaveBeenCalledWith(false)
    })

    it('reports valid (true) when failureEmails has at least one entry', () => {
      const onValidChange = vi.fn()
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ failureEmails: ['admin@test.com'] })}
          onUpdate={onUpdate}
          onValidChange={onValidChange}
        />
      )

      expect(onValidChange).toHaveBeenCalledWith(true)
    })
  })

  describe('onUpdate callback', () => {
    it('calls onUpdate on initial render with current config', () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({ failureEmails: ['test@example.com'] })}
          onUpdate={onUpdate}
        />
      )

      // The useEffect fires on mount, calling onUpdate with the current state
      expect(onUpdate).toHaveBeenCalled()
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0]
      expect(lastCall.failureEmails).toEqual(['test@example.com'])
    })

    it('calls onUpdate when success toggle is changed', async () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig()}
          onUpdate={onUpdate}
        />
      )

      // Find the first switch (success toggle)
      const switches = screen.getAllByRole('switch')
      const successSwitch = switches[0]
      fireEvent.click(successSwitch)

      await waitFor(() => {
        const calls = onUpdate.mock.calls
        const lastCall = calls[calls.length - 1][0]
        expect(lastCall.successEnabled).toBe(true)
      })
    })

    it('calls onUpdate when no-file toggle is changed', async () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig()}
          onUpdate={onUpdate}
        />
      )

      // The second switch is the no-file toggle
      const switches = screen.getAllByRole('switch')
      const noFileSwitch = switches[1]
      fireEvent.click(noFileSwitch)

      await waitFor(() => {
        const calls = onUpdate.mock.calls
        const lastCall = calls[calls.length - 1][0]
        expect(lastCall.noFileAlertEnabled).toBe(true)
      })
    })
  })

  describe('Copy-from-above functionality', () => {
    it('copies failure emails to success section when copy-from-above is clicked', async () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({
            failureEmails: ['admin@test.com', 'ops@test.com'],
            successEnabled: true,
          })}
          onUpdate={onUpdate}
        />
      )

      // Click "copy from above" in the success section
      const copyButtons = screen.getAllByText('copy from above')
      fireEvent.click(copyButtons[0])

      await waitFor(() => {
        const calls = onUpdate.mock.calls
        const lastCall = calls[calls.length - 1][0]
        expect(lastCall.successEmails).toEqual(['admin@test.com', 'ops@test.com'])
      })
    })

    it('copies failure emails to no-file section when copy-from-above is clicked', async () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig({
            failureEmails: ['admin@test.com'],
            noFileAlertEnabled: true,
          })}
          onUpdate={onUpdate}
        />
      )

      // The "copy from above" in the no-file section
      const copyButtons = screen.getAllByText('copy from above')
      // Last copy button is in the no-file section
      fireEvent.click(copyButtons[copyButtons.length - 1])

      await waitFor(() => {
        const calls = onUpdate.mock.calls
        const lastCall = calls[calls.length - 1][0]
        expect(lastCall.noFileAlertEmails).toEqual(['admin@test.com'])
      })
    })
  })

  describe('teamEmails prop', () => {
    it('renders without errors when teamEmails is provided', () => {
      const onUpdate = vi.fn()
      render(
        <NotificationsStep
          value={createDefaultConfig()}
          onUpdate={onUpdate}
          teamEmails={['team1@test.com', 'team2@test.com']}
        />
      )

      // Component renders successfully
      expect(screen.getByText('Failure')).toBeInTheDocument()
    })
  })
})
