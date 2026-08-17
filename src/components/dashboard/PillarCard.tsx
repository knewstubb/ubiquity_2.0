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
  /** Accent color for the card */
  accentColor: 'teal' | 'amber' | 'violet';
  links: PillarLink[];
}

const accentStyles = {
  teal: {
    border: 'border-l-primary',
    iconBg: 'bg-primary',
    iconText: 'text-white',
    linkHover: 'hover:text-primary',
    linkArrow: 'group-hover:text-primary',
  },
  amber: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-500',
    iconText: 'text-white',
    linkHover: 'hover:text-amber-600',
    linkArrow: 'group-hover:text-amber-600',
  },
  violet: {
    border: 'border-l-violet-500',
    iconBg: 'bg-violet-500',
    iconText: 'text-white',
    linkHover: 'hover:text-violet-600',
    linkArrow: 'group-hover:text-violet-600',
  },
};

/**
 * AAA Pillar card for the landing dashboard.
 * 
 * Features:
 * - Bold left border accent in pillar color
 * - Icon with solid colored background
 * - Hover lift with shadow
 * - Interactive link items with arrow animation
 */
export function PillarCard({ title, description, icon: IconComponent, accentColor, links }: PillarCardProps) {
  const navigate = useNavigate();
  const styles = accentStyles[accentColor];

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-background',
        'border-l-4',
        styles.border,
        'p-5 flex flex-col h-full',
        'transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div 
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
            'shadow-sm',
            styles.iconBg, 
            styles.iconText
          )}
        >
          <IconComponent size={20} weight="fill" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-0.5 mt-auto">
        {links.map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => navigate(link.path)}
            className={cn(
              'group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left',
              'text-sm font-medium text-foreground',
              'bg-transparent border-none cursor-pointer',
              'transition-all duration-150',
              'hover:bg-secondary/80',
              styles.linkHover
            )}
          >
            <span>{link.label}</span>
            <ArrowRight 
              size={14} 
              weight="bold" 
              className={cn(
                'text-muted-foreground transition-all duration-150',
                'group-hover:translate-x-0.5',
                styles.linkArrow
              )} 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
