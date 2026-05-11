import { useState, useMemo, useCallback } from 'react';
import { Plus, ImageSquare } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { ScopeSelector } from '../components/assets/ScopeSelector';
import { CampaignPicker } from '../components/assets/CampaignPicker';
import { SearchInput } from '../components/assets/SearchInput';
import { TypeFilter } from '../components/assets/TypeFilter';
import { AssetCard } from '../components/assets/AssetCard';
import { UploadDialog } from '../components/assets/UploadDialog';
import { AssetDetailPanel } from '../components/assets/AssetDetailPanel';
import { useAssets } from '../contexts/AssetsContext';
import { useCampaigns } from '../contexts/CampaignsContext';
import { useAccount } from '../contexts/AccountContext';
import { accounts } from '../data/accounts';
import type { AssetScope, Asset } from '../models/asset';


const ASSET_TYPES = ['image', 'colour', 'font', 'footer'];

function resolveScopeLabel(asset: Asset, campaignsList: { id: string; name: string }[]): string {
  if (asset.scope === 'global') return 'Global';
  if (asset.scope === 'campaign') {
    const campaign = campaignsList.find((c) => c.id === asset.campaignId);
    return campaign ? campaign.name : 'Campaign';
  }
  const account = accounts.find((a) => a.id === asset.accountId);
  return account ? account.name : 'Account';
}

export default function AssetsPage() {
  const { getAssetsByScope, addAsset, deleteAsset, assets } = useAssets();
  const { campaigns } = useCampaigns();
  const { selectedAccountId } = useAccount();

  const [activeScope, setActiveScope] = useState<AssetScope>('global');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Determine scope ID for filtering
  const scopeId = useMemo(() => {
    if (activeScope === 'campaign') return selectedCampaignId ?? undefined;
    if (activeScope === 'account') return selectedAccountId;
    return undefined;
  }, [activeScope, selectedCampaignId, selectedAccountId]);

  // Filtering pipeline: scope → type → search
  const filteredAssets = useMemo(() => {
    let result = getAssetsByScope(activeScope, scopeId);

    // Type filter (OR logic — if any selected, show only those types)
    if (selectedTypes.length > 0) {
      result = result.filter((a) => selectedTypes.includes(a.type));
    }

    // Search filter (case-insensitive name substring)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }

    return result;
  }, [getAssetsByScope, activeScope, scopeId, selectedTypes, searchQuery]);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  );

  const selectedAssetScopeLabel = useMemo(
    () => (selectedAsset ? resolveScopeLabel(selectedAsset, campaigns) : ''),
    [selectedAsset, campaigns],
  );

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const handleCardClick = useCallback((id: string) => {
    setSelectedAssetId(id);
  }, []);

  const handleUpload = useCallback(
    (asset: Omit<Asset, 'id' | 'createdAt'>) => {
      addAsset(asset);
    },
    [addAsset],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteAsset(id);
      setSelectedAssetId(null);
    },
    [deleteAsset],
  );

  const handleScopeChange = useCallback((scope: AssetScope) => {
    setActiveScope(scope);
    // Reset campaign selection when switching away from campaign tab
    if (scope !== 'campaign') {
      setSelectedCampaignId(null);
    }
  }, []);

  return (
    <PageShell
      title="Assets"
      action={
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border-none rounded font-semibold text-sm cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" onClick={() => setUploadDialogOpen(true)}>
          <Plus size={16} weight="bold" />
          Upload Asset
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ScopeSelector activeScope={activeScope} onScopeChange={handleScopeChange} />
        {activeScope === 'campaign' && (
          <CampaignPicker
            selectedCampaignId={selectedCampaignId}
            onCampaignChange={setSelectedCampaignId}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <TypeFilter types={ASSET_TYPES} selectedTypes={selectedTypes} onToggle={handleTypeToggle} />
        </div>
      </div>

      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onClick={handleCardClick} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-tertiary-foreground">
          <ImageSquare size={48} weight="duotone" className="text-tertiary-foreground mb-3" />
          <p className="text-base font-semibold text-muted-foreground m-0 mb-2">No assets found</p>
          <p className="text-sm text-tertiary-foreground m-0">
            Try adjusting your filters or upload a new asset to get started.
          </p>
        </div>
      )}

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
        campaigns={campaigns}
        currentAccountId={selectedAccountId}
      />

      <AssetDetailPanel
        asset={selectedAsset}
        onClose={() => setSelectedAssetId(null)}
        onDelete={handleDelete}
        scopeLabel={selectedAssetScopeLabel}
      />
    </PageShell>
  );
}
