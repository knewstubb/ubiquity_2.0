import { ArrowRight, DotsThree, PencilSimple, Pause, Play, Trash, UsersThree, NewspaperClipping } from '@phosphor-icons/react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SyncRule } from '../../models/account-sync';

interface SyncRuleCardProps {
  rule: SyncRule;
  sourceAccountName: string;
  targetAccountName: string;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  /** Renders as a nested transaction card (no indent — parent container handles layout) */
  nested?: boolean;
  /** If true, the parent contact rule is paused — disables resume for this transaction rule */
  parentPaused?: boolean;
}

export function SyncRuleCard({
  rule,
  sourceAccountName,
  targetAccountName,
  onToggleStatus,
  onEdit,
  onDelete,
  nested = false,
  parentPaused = false,
}: SyncRuleCardProps) {
  const isPaused = rule.status === 'paused';
  const isTransaction = rule.tableType === 'transaction';
  const mappedCount = rule.columnMappings.length;

  // Transaction rules can't be resumed if parent is paused
  const canToggle = !(isTransaction && isPaused && parentPaused);

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 bg-surface border border-border rounded-lg transition-all duration-200',
        'hover:shadow-md hover:border-primary/40',
        isPaused && 'opacity-60 bg-secondary border-border shadow-none hover:shadow-none hover:border-border',
      )}
    >
      {/* Icon */}
      <span className={cn(
        'inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-md',
        isTransaction ? 'bg-info-subtle text-info-foreground' : 'bg-success-subtle text-success-foreground',
      )}>
        {isTransaction ? <NewspaperClipping size={18} weight="duotone" /> : <UsersThree size={18} weight="duotone" />}
      </span>

      {/* Direction: Source → Target */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex flex-col min-w-0">
          {nested ? (
            /* Transaction cards show list names as the primary label */
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{rule.sourceListName ?? 'Source'}</span>
              <ArrowRight size={14} weight="bold" className="shrink-0 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground truncate">{rule.targetListName ?? 'Target'}</span>
            </div>
          ) : (
            /* Contact cards show account names */
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{sourceAccountName}</span>
              <ArrowRight size={14} weight="bold" className="shrink-0 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground truncate">{targetAccountName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={isTransaction ? 'info-subtle' : 'success-subtle'} className="text-[10px] px-1.5 py-0">
              {isTransaction ? 'Transaction' : 'Contacts'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Match: <span className="font-medium">{rule.matchColumnSource}</span> → <span className="font-medium">{rule.matchColumnTarget}</span>
            </span>
            <span className="text-xs text-tertiary-foreground">
              · {mappedCount} column{mappedCount !== 1 ? 's' : ''} mapped
            </span>
          </div>
        </div>
      </div>

      {/* Behaviour badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge variant={rule.onMissing === 'create' ? 'default-subtle' : 'neutral-subtle'} className="text-[10px] px-1.5 py-0">
          {rule.onMissing === 'create' ? 'Creates new' : 'Skip missing'}
        </Badge>
        {rule.triggerOnMappedOnly && (
          <Badge variant="warning-subtle" className="text-[10px] px-1.5 py-0">
            Mapped only
          </Badge>
        )}
        {isPaused && parentPaused && (
          <Badge variant="neutral-subtle" className="text-[10px] px-1.5 py-0">
            Parent paused
          </Badge>
        )}
      </div>

      {/* Toggle + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  size="sm"
                  checked={rule.status === 'active'}
                  onCheckedChange={() => onToggleStatus()}
                  disabled={!canToggle}
                />
              </div>
            </TooltipTrigger>
            {!canToggle && (
              <TooltipContent side="top">
                <p className="text-xs m-0">Resume the parent contact sync first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Sync rule actions"
            >
              <DotsThree size={20} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px] p-1.5">
            <DropdownMenuItem className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md" onSelect={onEdit}>
              <PencilSimple size={16} weight="regular" />
              Edit Rule
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md"
              onSelect={onToggleStatus}
              disabled={!canToggle}
            >
              {isPaused ? <Play size={16} weight="regular" /> : <Pause size={16} weight="regular" />}
              {isPaused ? 'Resume' : 'Pause'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md text-destructive focus:text-destructive focus:bg-destructive/5"
              onSelect={onDelete}
            >
              <Trash size={16} weight="regular" />
              Delete Rule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
