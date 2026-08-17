import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

export interface PillarLink {
  label: string;
  path: string;
  description?: string;
}

export interface PillarCardProps {
  title: string;
  description: string;
  icon: Icon;
  /** Accent color class for the icon background */
  accentColor: 'teal' | 'amber' | 'violet';
  links: PillarLink[];
}

const accentStyles = {
  teal: 'bg-primary/10 text-primary',
  amber: 'bg-amber-500/10 text-amber-600',
  violet: 'bg-violet-500/10 text-violet-600',
};

/**
 * AAA Pillar card for the landing dashboard.
 * Displays a pillar (Acquire, Analyse, Act) with quick-access links.
 */
export function PillarCard({ title, description, icon: IconComponent, accentColor, links }: PillarCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-background border border-border rounded-lg p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", accentStyles[accentColor])}>
          <IconComponent size={20} weight="duotone" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground m-0">{title}</h3>
          <p className="text-sm text-muted-foreground m-0 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-1 mt-auto">
        {links.map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => navigate(link.path)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-md text-left",
              "text-sm font-medium text-foreground",
              "bg-transparent border-none cursor-pointer",
              "transition-colors duration-150",
              "hover:bg-secondary"
            )}
          >
            <span>{link.label}</span>
            <ArrowRight size={14} weight="bold" className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
