import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { CampaignFolderCard } from '../components/campaign/CampaignFolderCard';
import { CreateCampaignDialog } from '../components/campaign/CreateCampaignDialog';
import { DeleteConfirmDialog } from '../components/campaign/DeleteConfirmDialog';
import { useAccount } from '../contexts/AccountContext';
import { useCampaigns } from '../contexts/CampaignsContext';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { filterByAccount, selectedAccountId } = useAccount();
  const {
    campaigns,
    campaignJourneys,
    addCampaign,
    updateCampaign,
    deleteCampaign,
  } = useCampaigns();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = filterByAccount(campaigns);

  function getJourneyCount(campaignId: string): number {
    return campaignJourneys.filter((j) => j.campaignId === campaignId).length;
  }

  const handleCardClick = useCallback(
    (id: string) => {
      navigate(`/automations/campaigns/${id}`);
    },
    [navigate],
  );

  const handleRename = useCallback(
    (id: string, newName: string) => {
      updateCampaign(id, { name: newName });
    },
    [updateCampaign],
  );

  const handleDeleteRequest = useCallback((id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      setDeleteTarget({ id: campaign.id, name: campaign.name });
    }
  }, [campaigns]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteCampaign(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteCampaign]);

  const handleCreate = useCallback(
    (name: string, goal: string) => {
      const newCampaign = {
        id: `camp-${Date.now()}`,
        name,
        accountId: selectedAccountId === 'acc-master' ? 'acc-master' : selectedAccountId,
        goal,
        dateRange: { start: new Date().toISOString().slice(0, 10), end: '' },
        status: 'draft' as const,
        journeyIds: [],
        tags: [],
      };
      addCampaign(newCampaign);
      setCreateOpen(false);
    },
    [addCampaign, selectedAccountId],
  );

  return (
    <PageShell
      title="Campaigns"
      subtitle="Campaign containers grouping related journeys"
      action={
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border-none rounded font-semibold text-sm cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" onClick={() => setCreateOpen(true)}>
          <Plus size={16} weight="bold" />
          New Campaign
        </button>
      }
    >
      {filtered.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filtered.map((campaign) => (
            <CampaignFolderCard
              key={campaign.id}
              campaign={campaign}
              journeyCount={getJourneyCount(campaign.id)}
              onClick={handleCardClick}
              onRename={handleRename}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-tertiary-foreground">
          <FolderOpen size={48} weight="duotone" className="text-tertiary-foreground mb-3" />
          <p className="text-base font-semibold text-muted-foreground m-0 mb-2">No campaigns found</p>
          <p className="text-sm text-tertiary-foreground m-0">
            Create your first campaign to start organising journeys.
          </p>
        </div>
      )}

      <CreateCampaignDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          itemName={deleteTarget.name}
          itemType="campaign"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </PageShell>
  );
}
