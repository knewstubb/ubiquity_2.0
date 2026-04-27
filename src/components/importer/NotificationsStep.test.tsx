import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { NotificationsStep } from './NotificationsStep';

/** Helper: enable the No File toggle so the sub-section renders */
async function enableNoFile(user: ReturnType<typeof userEvent.setup>) {
  const toggle = screen.getByLabelText('Enable', { selector: '#toggle-nofile-enable' });
  await user.click(toggle);
}

/** Helper: click a frequency tab */
async function selectFrequency(user: ReturnType<typeof userEvent.setup>, label: string) {
  const btn = screen.getByRole('button', { name: label });
  await user.click(btn);
}

describe('NotificationsStep — No File frequency-specific content', () => {
  it('defaults to Hourly frequency when No File is enabled', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);

    // Hourly tab should be active
    const hourlyBtn = screen.getByRole('button', { name: 'Hourly' });
    expect(hourlyBtn.className).toContain('segmentBtnActive');

    // Should show Starting, Every, At, Email Address
    expect(screen.getByLabelText('Starting date')).toBeInTheDocument();
    expect(screen.getByLabelText('Every interval')).toBeInTheDocument();
    expect(screen.getByLabelText('At time')).toBeInTheDocument();

    // Unit suffix should say "hours"
    expect(screen.getByText('hours')).toBeInTheDocument();

    // Should NOT show weekly or monthly sections
    expect(screen.queryByText('On')).not.toBeInTheDocument();
    expect(screen.queryByText('Pattern')).not.toBeInTheDocument();
    expect(screen.queryByText('On the')).not.toBeInTheDocument();
  });

  it('shows "Day/s" suffix for Daily frequency', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);
    await selectFrequency(user, 'Daily');

    expect(screen.getByText('Day/s')).toBeInTheDocument();
    expect(screen.queryByText('hours')).not.toBeInTheDocument();
  });

  it('shows day-of-week buttons for Weekly frequency', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);
    await selectFrequency(user, 'Weekly');

    // "On" label should appear
    expect(screen.getByText('On')).toBeInTheDocument();

    // 7 day buttons should be present
    const dayButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-pressed') !== null
    );
    expect(dayButtons).toHaveLength(7);

    // Default selected: T(1), W(2), F(4) — indices 1, 2, 4
    expect(dayButtons[1]).toHaveAttribute('aria-pressed', 'true');  // Tuesday
    expect(dayButtons[2]).toHaveAttribute('aria-pressed', 'true');  // Wednesday
    expect(dayButtons[4]).toHaveAttribute('aria-pressed', 'true');  // Friday
    expect(dayButtons[0]).toHaveAttribute('aria-pressed', 'false'); // Monday
    expect(dayButtons[3]).toHaveAttribute('aria-pressed', 'false'); // Thursday

    // Unit suffix should say "Week/s"
    expect(screen.getByText('Week/s')).toBeInTheDocument();
  });

  it('toggles day-of-week buttons on click', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);
    await selectFrequency(user, 'Weekly');

    const dayButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-pressed') !== null
    );

    // Monday starts unselected
    expect(dayButtons[0]).toHaveAttribute('aria-pressed', 'false');
    await user.click(dayButtons[0]);
    expect(dayButtons[0]).toHaveAttribute('aria-pressed', 'true');

    // Tuesday starts selected — toggle off
    expect(dayButtons[1]).toHaveAttribute('aria-pressed', 'true');
    await user.click(dayButtons[1]);
    expect(dayButtons[1]).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows Pattern and On the sections for Monthly frequency', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);
    await selectFrequency(user, 'Monthly');

    // Pattern toggle with Day/Date
    expect(screen.getByText('Pattern')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Day' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Date' })).toBeInTheDocument();

    // On the section with ordinal + day of week dropdowns
    expect(screen.getByText('On the')).toBeInTheDocument();
    expect(screen.getByLabelText('Ordinal')).toBeInTheDocument();
    expect(screen.getByLabelText('Day of week')).toBeInTheDocument();

    // Default values
    expect(screen.getByLabelText('Ordinal')).toHaveValue('2nd');
    expect(screen.getByLabelText('Day of week')).toHaveValue('Wednesday');

    // Unit suffix
    expect(screen.getByText('Months/s')).toBeInTheDocument();
  });

  it('switches monthly pattern between Day and Date', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);
    await selectFrequency(user, 'Monthly');

    const dayBtn = screen.getByRole('button', { name: 'Day' });
    const dateBtn = screen.getByRole('button', { name: 'Date' });

    // Day is active by default
    expect(dayBtn.className).toContain('patternBtnActive');
    expect(dateBtn.className).not.toContain('patternBtnActive');

    await user.click(dateBtn);
    expect(dateBtn.className).toContain('patternBtnActive');
    expect(dayBtn.className).not.toContain('patternBtnActive');
  });

  it('does not show weekly/monthly sections for Hourly or Daily', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);

    // Hourly (default) — no On, Pattern, On the
    expect(screen.queryByText('On')).not.toBeInTheDocument();
    expect(screen.queryByText('Pattern')).not.toBeInTheDocument();

    // Switch to Daily
    await selectFrequency(user, 'Daily');
    expect(screen.queryByText('On')).not.toBeInTheDocument();
    expect(screen.queryByText('Pattern')).not.toBeInTheDocument();
  });

  it('updates the ordinal and day-of-week dropdowns for Monthly', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);
    await selectFrequency(user, 'Monthly');

    const ordinalSelect = screen.getByLabelText('Ordinal');
    const daySelect = screen.getByLabelText('Day of week');

    await user.selectOptions(ordinalSelect, 'Last');
    expect(ordinalSelect).toHaveValue('Last');

    await user.selectOptions(daySelect, 'Friday');
    expect(daySelect).toHaveValue('Friday');
  });

  it('renders unit suffix as a styled badge element', async () => {
    const user = userEvent.setup();
    render(<NotificationsStep />);
    await enableNoFile(user);

    const suffix = screen.getByText('hours');
    // The suffix should be a span (badge), not inline text
    expect(suffix.tagName).toBe('SPAN');
  });
});
