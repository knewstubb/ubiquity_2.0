import { useState, type ReactNode } from 'react';
import type { Connection } from '../../models/connection';
import type { Automation } from '../../models/automation';
import { DotsThree, PencilSimple, Trash, Plus, CaretRight, Wrench } from '@phosphor-icons/react';
import { ProtocolIcon } from '../shared/ProtocolIcon';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ConnectionRowProps {
  connection: Connection;
  connectors: Automation[];
  onAddConnector: (connectionId: string) => void;
  onEditConnection?: (connectionId: string) => void;
  onFixConnection?: (connectionId: string) => void;
  onDeleteConnection?: (connectionId: string) => void;
  children?: ReactNode;
}

export function ConnectionRow({ connection, connectors, onAddConnector, onEditConnection, onFixConnection, onDeleteConnection, children }: ConnectionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const connectorCount = connectors.length;
  const activeCount = connectors.filter((c) => c.status === 'active').length;
  const isError = connection.status === 'error';

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="border border-border rounded-lg p-4 mb-6 bg-surface/50 transition-all">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between gap-3 min-h-8 cursor-pointer select-none relative focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-md">
            {/* Left: Chevron + Connection info */}
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'inline-flex items-center justify-center text-tertiary-foreground shrink-0 transition-transform duration-200',
                  expanded && 'rotate-90'
                )}
                aria-hidden="true"
              >
                <CaretRight size={16} weight="bold" />
              </span>

              <div className="flex items-center gap-2">
                <ProtocolIcon protocol={connection.protocol} size={20} error={isError} inactive={connectorCount === 0} />
                <span className="text-[14px] font-medium text-muted-foreground">{connection.protocol === 'S3' ? 'AWS S3' : connection.protocol}:</span>
                <span className={cn('text-base font-semibold text-foreground', isError && 'text-destructive')}>{connection.name}</span>
              </div>
            </div>

            {/* Status text — right aligned */}
            {isError ? (
              <Button
                variant="destructiveOutline"
                size="sm"
                className="ml-auto mr-10"
                onClick={(e) => { e.stopPropagation(); onFixConnection?.(connection.id); }}
              >
                <Wrench size={14} weight="bold" />
                Fix connection
              </Button>
            ) : (
              connectorCount === 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto mr-10 text-primary border-primary/40 hover:bg-primary/5 hover:text-primary"
                  onClick={(e) => { e.stopPropagation(); onAddConnector(connection.id); }}
                >
                  <Plus size={14} weight="bold" />
                  Add automation
                </Button>
              ) : (
                <span className="ml-auto mr-10 text-base text-muted-foreground">
                  <span className="font-semibold">{activeCount}</span> of <span className="font-semibold">{connectorCount}</span> automations active
                </span>
              )
            )}

            {/* Right: Actions menu */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-secondary transition-colors"
                    aria-label="Connection actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DotsThree size={20} weight="bold" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px] p-1.5" onClick={(e) => e.stopPropagation()}>
                  {!isError && (
                    <DropdownMenuItem
                      className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md"
                      onSelect={(e) => { e.preventDefault(); onAddConnector(connection.id); }}
                    >
                      <Plus size={16} weight="regular" /> Add Automation
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md"
                    onSelect={(e) => { e.preventDefault(); onEditConnection?.(connection.id); }}
                  >
                    <PencilSimple size={16} weight="regular" /> Edit Connection
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md text-destructive focus:text-destructive focus:bg-destructive/5"
                    disabled={connectorCount > 0}
                    title={connectorCount > 0 ? 'Remove all Automations before deleting connection' : undefined}
                    onSelect={(e) => { e.preventDefault(); onDeleteConnection?.(connection.id); }}
                  >
                    <Trash size={16} weight="regular" /> Delete Connection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent forceMount className={cn(expanded ? "overflow-visible" : "overflow-hidden")}>
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-300',
              expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="min-h-0 overflow-hidden">
              {children && (
                <div className="pt-4 pb-1 px-1 -mx-1 flex flex-col gap-3">
                  {children}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
