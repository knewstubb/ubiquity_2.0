import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { ToastProvider } from '../../components/shared/Toast';
import { DataLayerProvider } from '../../providers/DataLayerProvider';
import { CampaignsProvider, useCampaigns } from '../CampaignsContext';
import type { Campaign, Journey } from '../../models/campaign';

const STORAGE_KEY = 'ubiquity-campaigns';

const testCampaign: Campaign = {
  id: 'cmp-test',
  name: 'Test Campaign',
  accountId: 'acc-master',
  goal: 'Testing',
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  status: 'draft',
  journeyIds: [],
  tags: [],
};

const testJourney: Journey = {
  id: 'jrn-test',
  name: 'Test Journey',
  campaignId: 'cmp-test',
  accountId: 'acc-master',
  status: 'draft',
  nodeCount: 0,
  entryCount: 0,
  type: 'welcome',
};

// Helper component that exposes context methods via buttons
function TestConsumer() {
  const ctx = useCampaigns();

  return (
    <div>
      <span data-testid="campaign-count">{ctx.campaigns.length}</span>
      <span data-testid="journey-count">{ctx.campaignJourneys.length}</span>
      <span data-testid="campaign-names">
        {ctx.campaigns.map((c) => c.name).join(',')}
      </span>
      <span data-testid="journey-names">
        {ctx.campaignJourneys.map((j) => j.name).join(',')}
      </span>
      <span data-testid="journeys-for-campaign">
        {ctx.getJourneysForCampaign('cmp-test').map((j) => j.name).join(',')}
      </span>

      <button onClick={() => ctx.addCampaign(testCampaign)}>Add Campaign</button>
      <button onClick={() => ctx.updateCampaign('cmp-test', { name: 'Updated Campaign' })}>
        Update Campaign
      </button>
      <button onClick={() => ctx.deleteCampaign('cmp-test')}>Delete Campaign</button>
      <button onClick={() => ctx.addJourney(testJourney)}>Add Journey</button>
      <button onClick={() => ctx.deleteJourney('jrn-test')}>Delete Journey</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <DataLayerProvider>
        <CampaignsProvider>
          <TestConsumer />
        </CampaignsProvider>
      </DataLayerProvider>
    </ToastProvider>,
  );
}

describe('CampaignsContext', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('initialises with seed data', () => {
    renderWithProvider();
    // Seed data has 4 campaigns
    expect(Number(screen.getByTestId('campaign-count').textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId('journey-count').textContent)).toBeGreaterThan(0);
  });

  it('addCampaign adds a campaign to the list', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    const initialCount = Number(screen.getByTestId('campaign-count').textContent);

    await user.click(screen.getByText('Add Campaign'));

    expect(Number(screen.getByTestId('campaign-count').textContent)).toBe(initialCount + 1);
    expect(screen.getByTestId('campaign-names').textContent).toContain('Test Campaign');
  });

  it('updateCampaign updates the matching campaign', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Add Campaign'));
    expect(screen.getByTestId('campaign-names').textContent).toContain('Test Campaign');

    await user.click(screen.getByText('Update Campaign'));
    expect(screen.getByTestId('campaign-names').textContent).toContain('Updated Campaign');
    expect(screen.getByTestId('campaign-names').textContent).not.toContain('Test Campaign');
  });

  it('deleteCampaign removes campaign and cascade-deletes its journeys', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Add Campaign'));
    await user.click(screen.getByText('Add Journey'));

    expect(screen.getByTestId('campaign-names').textContent).toContain('Test Campaign');
    expect(screen.getByTestId('journey-names').textContent).toContain('Test Journey');

    await user.click(screen.getByText('Delete Campaign'));

    expect(screen.getByTestId('campaign-names').textContent).not.toContain('Test Campaign');
    expect(screen.getByTestId('journey-names').textContent).not.toContain('Test Journey');
  });

  it('addJourney adds journey and updates parent campaign journeyIds', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Add Campaign'));
    await user.click(screen.getByText('Add Journey'));

    expect(screen.getByTestId('journey-names').textContent).toContain('Test Journey');
    expect(screen.getByTestId('journeys-for-campaign').textContent).toContain('Test Journey');
  });

  it('deleteJourney removes journey and updates parent campaign journeyIds', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Add Campaign'));
    await user.click(screen.getByText('Add Journey'));
    expect(screen.getByTestId('journeys-for-campaign').textContent).toContain('Test Journey');

    await user.click(screen.getByText('Delete Journey'));
    expect(screen.getByTestId('journeys-for-campaign').textContent).not.toContain('Test Journey');
  });

  it('getJourneysForCampaign returns correct subset', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Add Campaign'));
    await user.click(screen.getByText('Add Journey'));

    const journeysText = screen.getByTestId('journeys-for-campaign').textContent;
    expect(journeysText).toBe('Test Journey');
  });

  it('persists state to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Add Campaign'));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(stored.campaigns.some((c: Campaign) => c.id === 'cmp-test')).toBe(true);
  });

  it('restores state from localStorage', () => {
    const savedState = {
      campaigns: [testCampaign],
      journeys: [testJourney],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

    renderWithProvider();

    expect(screen.getByTestId('campaign-names').textContent).toBe('Test Campaign');
    expect(screen.getByTestId('journey-names').textContent).toBe('Test Journey');
  });
});
