import { useCallback } from 'react';
import { X, FloppyDisk, Envelope, ListBullets, ChartBar } from '@phosphor-icons/react';
import styles from './ContentModal.module.css';

export interface ContentModalProps {
  contentType: 'email' | 'form' | 'survey';
  nodeLabel: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

const CONTENT_META: Record<
  ContentModalProps['contentType'],
  { title: string; icon: React.ComponentType<{ size?: number; weight?: string }> }
> = {
  email: { title: 'Email Builder', icon: Envelope },
  form: { title: 'Form Builder', icon: ListBullets },
  survey: { title: 'Survey Builder', icon: ChartBar },
};

export function ContentModal({ contentType, nodeLabel, onClose, onSave }: ContentModalProps) {
  const meta = CONTENT_META[contentType];
  const Icon = meta.icon;

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSave = useCallback(() => {
    // Placeholder — in the full product this would return real content
    onSave(`[${contentType} content for "${nodeLabel}"]`);
  }, [contentType, nodeLabel, onSave]);

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <span id="content-modal-title" className={styles.headerLabel}>
            {meta.title}
          </span>
          <span className={styles.badge}>{nodeLabel}</span>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close content editor"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body — placeholder builder UI */}
        <div className={styles.body}>
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>
              <Icon size={32} weight="duotone" />
            </div>
            <p className={styles.placeholderTitle}>{meta.title} placeholder</p>
            <p className={styles.placeholderText}>
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)} builder placeholder
              — content editing will be available in the full product.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            <FloppyDisk size={16} weight="bold" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
