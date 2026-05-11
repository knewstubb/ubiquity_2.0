import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  CheckCircle,
  GearSix,
  ArrowLeft,
} from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { ValidationError } from '../../utils/journeyValidation';

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

const statusClasses: Record<string, string> = {
  draft: 'bg-secondary text-muted-foreground',
  active: 'bg-mint-50 text-mint-700',
  paused: 'bg-amber-50 text-amber-700',
  completed: 'bg-secondary text-tertiary-foreground',
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

      <div className="flex-1" />

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
