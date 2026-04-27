import { useEffect } from 'react';
import { useCampaigns } from '../../contexts/CampaignsContext';
import { Dropdown } from '../shared/Dropdown';
import styles from './CampaignPicker.module.css';

interface CampaignPickerProps {
  selectedCampaignId: string | null;
  onCampaignChange: (campaignId: string) => void;
}

export function CampaignPicker({ selectedCampaignId, onCampaignChange }: CampaignPickerProps) {
  const { campaigns } = useCampaigns();

  // Default to first campaign if none selected
  useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      onCampaignChange(campaigns[0].id);
    }
  }, [selectedCampaignId, campaigns, onCampaignChange]);

  const options = campaigns.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className={styles.wrapper}>
      <Dropdown
        label="Campaign"
        options={options}
        value={selectedCampaignId ?? ''}
        onChange={(e) => onCampaignChange(e.target.value)}
        placeholder="Select a campaign"
      />
    </div>
  );
}
