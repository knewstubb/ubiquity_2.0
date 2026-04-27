import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  CheckCircle,
  GearSix,
  ArrowLeft,
} from '@phosphor-icons/react';
import type { ValidationError } from '../../utils/journeyValidation';
import styles from './CanvasToolbar.module.css';

export interface CanvasToolbarProps {
  journeyName: string;
  journeyStatus: 'draft' | 'active' | 'paused' | 'completed';
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onValidate: () => void;
  onSettings: () => void;
  validationErrors?: ValidationError[];
}

const statusClassMap: Record<string, string> = {
  draft: styles.statusDraft,
  active: styles.statusActive,
  paused: styles.statusPaused,
  completed: styles.statusCompleted,
};

export function CanvasToolbar({
  journeyName,
  journeyStatus,
  onZoomIn,
  onZoomOut,
  onFitView,
  onValidate,
  onSettings,
  validationErrors = [],
}: CanvasToolbarProps) {
  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;

  return (
    <div className={styles.toolbar}>
      {/* Back to journeys list */}
      <a href="/automations/journeys" className={styles.backButton}>
        <ArrowLeft size={16} weight="bold" />
        <span>Journeys</span>
      </a>

      <div className={styles.divider} />

      {/* Journey name + status badge */}
      <div className={styles.journeyInfo}>
        <span className={styles.journeyName}>{journeyName}</span>
        <span
          className={`${styles.statusBadge} ${statusClassMap[journeyStatus] ?? styles.statusDraft}`}
        >
          {journeyStatus}
        </span>
      </div>

      <div className={styles.spacer} />

      {/* Zoom controls */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.iconButton}
          onClick={onZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <MagnifyingGlassMinus size={18} weight="regular" />
        </button>
        <button
          className={styles.iconButton}
          onClick={onZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <MagnifyingGlassPlus size={18} weight="regular" />
        </button>
        <button
          className={styles.iconButton}
          onClick={onFitView}
          title="Fit to view"
          aria-label="Fit to view"
        >
          <ArrowsOut size={18} weight="regular" />
        </button>
      </div>

      <div className={styles.divider} />

      {/* Validate */}
      <button
        className={styles.validateButton}
        onClick={onValidate}
        title="Validate journey"
        aria-label="Validate journey"
      >
        <CheckCircle size={16} weight="regular" />
        <span>Validate</span>
        {errorCount > 0 && (
          <span className={styles.errorBadge}>{errorCount}</span>
        )}
      </button>

      {/* Settings */}
      <button
        className={styles.iconButton}
        onClick={onSettings}
        title="Journey settings"
        aria-label="Journey settings"
      >
        <GearSix size={18} weight="regular" />
      </button>
    </div>
  );
}
