import { Image, FileText } from '@phosphor-icons/react';
import type { Asset } from '../../models/asset';
import styles from './AssetCard.module.css';

interface AssetCardProps {
  asset: Asset;
  onClick: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AssetPreview({ asset }: { asset: Asset }) {
  switch (asset.type) {
    case 'image':
      return (
        <div className={`${styles.preview} ${styles.previewImage}`}>
          <Image size={48} weight="thin" />
        </div>
      );
    case 'colour':
      return (
        <div className={styles.preview}>
          <div
            className={styles.previewColour}
            style={{ backgroundColor: asset.colourValue ?? '#cccccc' }}
          />
        </div>
      );
    case 'font':
      return (
        <div className={styles.preview}>
          <span className={styles.previewFont}>Aa</span>
        </div>
      );
    case 'footer':
      return (
        <div className={`${styles.preview} ${styles.previewFooter}`}>
          <FileText size={48} weight="thin" />
        </div>
      );
  }
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  return (
    <div
      className={styles.card}
      onClick={() => onClick(asset.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(asset.id);
        }
      }}
    >
      <AssetPreview asset={asset} />
      <div className={styles.body}>
        <p className={styles.name}>{asset.name}</p>
        <div className={styles.meta}>
          <span className={styles.badge}>{asset.type}</span>
          <span className={styles.scope}>{asset.scope}</span>
        </div>
        <span className={styles.date}>{formatDate(asset.createdAt)}</span>
      </div>
    </div>
  );
}
