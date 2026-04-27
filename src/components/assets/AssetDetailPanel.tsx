import { useState } from 'react';
import { X, Trash, Image, FileText } from '@phosphor-icons/react';
import type { Asset } from '../../models/asset';
import styles from './AssetDetailPanel.module.css';

interface AssetDetailPanelProps {
  asset: Asset | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  scopeLabel: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DetailPreview({ asset }: { asset: Asset }) {
  switch (asset.type) {
    case 'image':
      return (
        <div className={`${styles.preview} ${styles.previewImage}`}>
          <Image size={72} weight="thin" />
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
          <FileText size={72} weight="thin" />
        </div>
      );
  }
}

export function AssetDetailPanel({ asset, onClose, onDelete, scopeLabel }: AssetDetailPanelProps) {
  const [confirming, setConfirming] = useState(false);

  if (!asset) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleDelete() {
    onDelete(asset!.id);
    setConfirming(false);
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleBackdropClick} />
      <aside className={styles.panel} role="dialog" aria-modal="true" aria-label="Asset details">
        <div className={styles.header}>
          <h2 className={styles.heading}>{asset.name}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <DetailPreview asset={asset} />

        <div className={styles.content}>
          <div className={styles.metaList}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Type</span>
              <span className={styles.metaValue}>{asset.type}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Scope</span>
              <span className={styles.metaValue}>{scopeLabel}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Created</span>
              <span className={styles.metaValue}>{formatDate(asset.createdAt)}</span>
            </div>
            {asset.type === 'colour' && asset.colourValue && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Colour</span>
                <span className={styles.metaValue}>{asset.colourValue}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          {!confirming ? (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => setConfirming(true)}
            >
              <Trash size={16} />
              Delete Asset
            </button>
          ) : (
            <div className={styles.confirmBar}>
              <p className={styles.confirmText}>Are you sure? This cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmDelete}
                  onClick={handleDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
