import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Path } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { TagFilter } from '../components/campaign/TagFilter';
import { JourneyCard } from '../components/campaign/JourneyCard';
import { DeleteConfirmDialog } from '../components/campaign/DeleteConfirmDialog';
import { useAccount } from '../contexts/AccountContext';
import { useCampaigns } from '../contexts/CampaignsContext';
import { useJourneys } from '../contexts/JourneysContext';

export default function JourneysPage() {
  const navigate = useNavigate();
  const { filterByAccount } = useAccount();
  const {
    campaigns,
    campaignJourneys,
    updateJourney: updateCampaignJourney,
    deleteJourney: deleteCampaignJourney,
  } = useCampaigns();
  const { deleteJourney: deleteJourneyDefinition } = useJourneys();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const campaignNameMap = useMemo(
    () => new Map(campaigns.map((c) => [c.id, c.name])),
    [campaigns],
  );

  const accountFilteredJourneys = filterByAccount(campaignJourneys);

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

  return (
    <PageShell
      title="All Journeys"
      subtitle="All journey flows across campaigns"
    >
      {distinctTypes.length > 0 && (
        <div className="mb-4">
          <TagFilter
            tags={distinctTypes}
            selectedTags={selectedTags}
            onToggle={handleTagToggle}
          />
        </div>
      )}

      {filteredJourneys.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filteredJourneys.map((journey) => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              campaignName={campaignNameMap.get(journey.campaignId)}
              onClick={handleJourneyClick}
              onRename={handleRename}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-tertiary-foreground">
          <Path size={48} weight="duotone" className="text-tertiary-foreground mb-3" />
          <p className="text-base font-semibold text-muted-foreground mb-2">No journeys found</p>
          <p className="text-sm text-tertiary-foreground m-0">
            Journeys will appear here once created within a campaign.
          </p>
        </div>
      )}

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
