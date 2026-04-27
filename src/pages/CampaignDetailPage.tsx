import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Path } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { BreadcrumbBar } from '../components/campaign/BreadcrumbBar';
import { TagFilter } from '../components/campaign/TagFilter';
import { JourneyCard } from '../components/campaign/JourneyCard';
import { CreateJourneyDialog } from '../components/campaign/CreateJourneyDialog';
import { DeleteConfirmDialog } from '../components/campaign/DeleteConfirmDialog';
import { useAccount } from '../contexts/AccountContext';
import { useCampaigns } from '../contexts/CampaignsContext';
import { useJourneys } from '../contexts/JourneysContext';
import type { JourneyType } from '../models/campaign';
import type { JourneyDefinition } from '../models/journey';
import styles from './CampaignDetailPage.module.css';

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { filterByAccount, selectedAccountId } = useAccount();
  const {
    campaigns,
    getJourneysForCampaign,
    addJourney: addCampaignJourney,
    updateJourney: updateCampaignJourney,
    deleteJourney: deleteCampaignJourney,
  } = useCampaigns();
  const { addJourney: addJourneyDefinition, deleteJourney: deleteJourneyDefinition } = useJourneys();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const campaign = campaigns.find((c) => c.id === campaignId);

  const allJourneys = campaign ? getJourneysForCampaign(campaign.id) : [];
  const accountFilteredJourneys = filterByAccount(allJourneys);

  const distinctTypes = useMemo(() => {
    const types = new Set(accountFilteredJourneys.map((j) => j.type));
    return Array.from(types).sort();
  }, [accountFilteredJourneys]);

  const filteredJourneys = useMemo(() => {
    if (selectedTags.length === 0) return accountFilteredJourneys;
    return accountFilteredJourneys.filter((j) => selectedTags.includes(j.type));
  }, [accountFilteredJourneys, selectedTags]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleJourneyClick = useCallback(
    (id: string) => {
      navigate(`/automations/journeys/${id}`);
    },
    [navigate],
  );

  const handleRename = useCallback(
    (id: string, newName: string) => {
      updateCampaignJourney(id, { name: newName });
    },
    [updateCampaignJourney],
  );

  const handleDeleteRequest = useCallback(
    (id: string) => {
      const journey = accountFilteredJourneys.find((j) => j.id === id);
      if (journey) {
        setDeleteTarget({ id: journey.id, name: journey.name });
      }
    },
    [accountFilteredJourneys],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteCampaignJourney(deleteTarget.id);
      deleteJourneyDefinition(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteCampaignJourney, deleteJourneyDefinition]);

  const handleCreate = useCallback(
    (name: string, type: JourneyType) => {
      if (!campaign) return;
      const newId = `journey-${Date.now()}`;
      const accountId =
        selectedAccountId === 'acc-master' ? campaign.accountId : selectedAccountId;

      // Add journey metadata to CampaignsContext
      addCampaignJourney({
        id: newId,
        name,
        campaignId: campaign.id,
        accountId,
        status: 'draft',
        nodeCount: 0,
        entryCount: 0,
        type,
      });

      // Add journey definition to JourneysContext
      const journeyDef: JourneyDefinition = {
        id: newId,
        name,
        campaignId: campaign.id,
        accountId,
        status: 'draft',
        nodeCount: 0,
        entryCount: 0,
        type,
        nodes: [],
        edges: [],
        settings: {
          name,
          description: '',
          journeyType: type,
          entryCriteria: { segmentId: '' },
          reEntryRule: 'block',
          status: 'draft',
        },
      };
      addJourneyDefinition(journeyDef);

      setCreateOpen(false);
      navigate(`/automations/journeys/${newId}`);
    },
    [campaign, selectedAccountId, addCampaignJourney, addJourneyDefinition, navigate],
  );

  // Campaign not found
  if (!campaign) {
    return (
      <PageShell title="Campaign Not Found">
        <div className={styles.notFound}>
          <p className={styles.notFoundTitle}>Campaign not found</p>
          <Link className={styles.notFoundLink} to="/automations/campaigns">
            ← Back to Campaigns
          </Link>
        </div>
      </PageShell>
    );
  }

  const breadcrumbItems = [
    { label: 'Campaigns', to: '/automations/campaigns' },
    { label: campaign.name },
  ];

  return (
    <PageShell
      title={campaign.name}
      action={
        <button className={styles.createButton} onClick={() => setCreateOpen(true)}>
          <Plus size={16} weight="bold" />
          Create Journey
        </button>
      }
    >
      <BreadcrumbBar items={breadcrumbItems} />

      {distinctTypes.length > 0 && (
        <div className={styles.filterRow}>
          <TagFilter
            tags={distinctTypes}
            selectedTags={selectedTags}
            onToggle={handleTagToggle}
          />
        </div>
      )}

      {filteredJourneys.length > 0 ? (
        <div className={styles.grid}>
          {filteredJourneys.map((journey) => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              onClick={handleJourneyClick}
              onRename={handleRename}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Path size={48} weight="duotone" className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No journeys yet</p>
          <p className={styles.emptyMessage}>
            Create your first journey to get started with this campaign.
          </p>
        </div>
      )}

      <CreateJourneyDialog
        open={createOpen}
        campaignId={campaign.id}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          itemName={deleteTarget.name}
          itemType="journey"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </PageShell>
  );
}
