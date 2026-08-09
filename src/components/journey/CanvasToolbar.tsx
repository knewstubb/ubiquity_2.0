import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  CheckCircle,
  GearSix,
  ArrowLeft,
  Cloud,
  CloudCheck,
  CloudSlash,
  ArrowUUpLeft,
  ArrowUUpRight,
} from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { ValidationError } from '../../utils/journeyValidation';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface CanvasToolbarProps {
  journeyName: string;
  journeyStatus: 'draft' | 'active' | 'paused' | 'completed';
  saveStatus?: SaveStatus;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onValidate: () => void;
  onSettings: () => void;
  validationErrors?: ValidationError[];
  /** Undo/redo state and handlers */
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const statusClasses: Record<string, string> = {
  draft: 'bg-secondary text-muted-foreground',
  active: 'bg-mint-50 text-mint-700',
  paused: 'bg-amber-50 text-amber-700',
  completed: 'bg-secondary text-tertiary-foreground',
};

export function CanvasToolbar({
  journeyName,
  journeyStatus,
  saveStatus = 'saved',
  onZoomIn,
  onZoomOut,
  onFitView,
  onValidate,
  onSettings,
  validationErrors = [],
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: CanvasToolbarProps) {
  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;

  const saveIndicator = {
    saved: { icon: CloudCheck, text: 'Saved', className: 'text-primary' },
    saving: { icon: Cloud, text: 'Saving...', className: 'text-muted-foreground animate-pulse' },
    unsaved: { icon: Cloud, text: 'Unsaved', className: 'text-amber-500' },
    error: { icon: CloudSlash, text: 'Save failed', className: 'text-red-500' },
  }[saveStatus];

  const SaveIcon = saveIndicator.icon;

  return (
    <div className="flex items-center gap-2 h-12 px-4 bg-background border-b border-border font-sans shrink-0">
      {/* Back to journeys list */}
      <a
        href="/automations/journeys"
        className="flex items-center gap-1 px-2 py-1 border-none bg-transparent text-muted-foreground text-sm font-medium cursor-pointer rounded-sm transition-colors duration-150 no-underline hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft size={16} weight="bold" />
        <span>Journeys</span>
      </a>

      <div className="w-px h-6 bg-border shrink-0" />

      {/* Journey name + status badge */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-60">
          {journeyName}
        </span>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight whitespace-nowrap capitalize',
            statusClasses[journeyStatus] ?? statusClasses.draft,
          )}
        >
          {journeyStatus}
        </span>
      </div>

      {/* Save indicator */}
      <div className={cn('flex items-center gap-1 text-xs', saveIndicator.className)}>
        <SaveIcon size={14} weight="regular" />
        <span>{saveIndicator.text}</span>
      </div>

      <div className="flex-1" />

      {/* Undo/Redo controls */}
      <div className="flex items-center gap-0.5">
        <button
          className={cn(
            'flex items-center justify-center w-8 h-8 border-none bg-transparent cursor-pointer rounded-sm transition-colors duration-150 relative',
            canUndo
              ? 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              : 'text-muted-foreground/40 cursor-not-allowed',
          )}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          aria-label="Undo"
        >
          <ArrowUUpLeft size={18} weight="regular" />
        </button>
        <button
          className={cn(
            'flex items-center justify-center w-8 h-8 border-none bg-transparent cursor-pointer rounded-sm transition-colors duration-150 relative',
            canRedo
              ? 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              : 'text-muted-foreground/40 cursor-not-allowed',
          )}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          aria-label="Redo"
        >
          <ArrowUUpRight size={18} weight="regular" />
        </button>
      </div>

      <div className="w-px h-6 bg-border shrink-0" />

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5">
        <button
          className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-muted-foreground cursor-pointer rounded-sm transition-colors duration-150 relative hover:bg-secondary hover:text-foreground"
          onClick={onZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <MagnifyingGlassMinus size={18} weight="regular" />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-muted-foreground cursor-pointer rounded-sm transition-colors duration-150 relative hover:bg-secondary hover:text-foreground"
          onClick={onZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <MagnifyingGlassPlus size={18} weight="regular" />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-muted-foreground cursor-pointer rounded-sm transition-colors duration-150 relative hover:bg-secondary hover:text-foreground"
          onClick={onFitView}
          title="Fit to view"
          aria-label="Fit to view"
        >
          <ArrowsOut size={18} weight="regular" />
        </button>
      </div>

      <div className="w-px h-6 bg-border shrink-0" />

      {/* Validate */}
      <button
        className="flex items-center gap-1 px-2 py-1 border border-border bg-background text-muted-foreground text-xs font-medium cursor-pointer rounded-sm transition-colors duration-150 relative hover:bg-secondary hover:text-foreground hover:border-border-strong"
        onClick={onValidate}
        title="Validate journey"
        aria-label="Validate journey"
      >
        <CheckCircle size={16} weight="regular" />
        <span>Validate</span>
        {errorCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full bg-red-500 text-primary-foreground text-[10px] font-bold leading-none">
            {errorCount}
          </span>
        )}
      </button>

      {/* Settings */}
      <button
        className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-muted-foreground cursor-pointer rounded-sm transition-colors duration-150 relative hover:bg-secondary hover:text-foreground"
        onClick={onSettings}
        title="Journey settings"
        aria-label="Journey settings"
      >
        <GearSix size={18} weight="regular" />
      </button>
    </div>
  );
}
