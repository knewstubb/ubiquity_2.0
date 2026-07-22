import { ArrowRight, DotsThree, PencilSimple, Trash, UsersThree, NewspaperClipping } from '@phosphor-icons/react';
import { Switch } from '@/components/ui/switch';
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
  nested?: boolean;
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

  const canToggle = !(isTransaction && isPaused && parentPaused);

  return (
    <div
      className={cn(
        'flex items-center px-5 py-4 gap-3 cursor-pointer transition-colors duration-150',
        'hover:bg-secondary/50',
      )}
      role="button"
      tabIndex={0}
      onClick={() => onEdit()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } }}
    >
      {/* Icon — 24px, no background */}
      <span className={cn('inline-flex items-center justify-center shrink-0', isPaused && 'opacity-40')}>
        {isTransaction
          ? <NewspaperClipping size={24} weight="regular" className="text-muted-foreground" />
          : <UsersThree size={24} weight="fill" className="text-primary" />
        }
      </span>

      {/* Direction + type label — takes available space */}
      <div className={cn('flex flex-col min-w-0', isPaused && 'opacity-40')}>
        <div className="flex items-center gap-1.5">
          {nested ? (
            <>
              <span className="text-base font-semibold text-foreground">{rule.sourceListName ?? 'Source'}</span>
              <ArrowRight size={12} weight="bold" className="shrink-0 text-muted-foreground" />
              <span className="text-base font-semibold text-foreground">{rule.targetListName ?? 'Target'}</span>
            </>
          ) : (
            <>
              <span className="text-base font-semibold text-foreground">{sourceAccountName}</span>
              <ArrowRight size={12} weight="bold" className="shrink-0 text-muted-foreground" />
              <span className="text-base font-semibold text-foreground">{targetAccountName}</span>
            </>
          )}
        </div>
        <span className="text-[13px] text-muted-foreground mt-0.5">
          {isTransaction ? 'Transactional' : 'Contacts'}
        </span>
      </div>

      {/* Match key + column count + behaviour */}
      <div className={cn('flex flex-col items-end ml-auto shrink-0', isPaused && 'opacity-40')}>
        <span className="text-[13px] text-muted-foreground">
          Match: {' '}
          <span className="font-semibold text-foreground">{rule.matchColumnSource}</span>
          {' → '}
          <span className="font-semibold text-foreground">{rule.matchColumnTarget}</span>
        </span>
        <span className="text-sm text-tertiary-foreground mt-0.5">
          {mappedCount} column{mappedCount !== 1 ? 's' : ''} mapped
          {rule.onMissing === 'create' ? <> {' | '} Creates new</> : <> {' | '} Skip missing</>}
          {rule.triggerOnMappedOnly ? <> {' | '} Mapped only</> : <> {' | '} All changes</>}
        </span>
      </div>

      {/* Toggle — always full opacity */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0 ml-4">
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

      {/* Three-dot menu */}
      <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Sync rule actions"
            >
              <DotsThree size={20} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px] p-1.5">
            <DropdownMenuItem className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md" onSelect={() => onEdit()}>
              <PencilSimple size={16} weight="regular" />
              Edit Rule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md text-destructive focus:text-destructive focus:bg-destructive/5"
              onSelect={() => onDelete()}
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
