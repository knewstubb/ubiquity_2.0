import { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRight, ArrowsLeftRight, WarningCircle } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CloseButton } from '@/components/ui/close-button';
import { useAccount } from '../../contexts/AccountContext';
import { accountSchemas } from '../../data/account-sync';
import type { SyncRule, ColumnMapping, SyncTableType, OnMissingBehaviour } from '../../models/account-sync';
import { cn } from '@/lib/utils';

interface CreateSyncRuleModalProps {
  open: boolean;
  tableType: SyncTableType;
  parentRule?: SyncRule;
  rule?: SyncRule;
  onSave: (rule: SyncRule) => void;
  onClose: () => void;
}

function generateId(): string {
  return `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Simple auto-match: if source column name exists in target columns, use it */
function autoMatchColumn(source: string, targetColumns: string[]): string {
  // Exact match
  if (targetColumns.includes(source)) return source;
  // Normalised match (lowercase, trim underscores)
  const norm = (s: string) => s.toLowerCase().replace(/[_\-\s]/g, '');
  const match = targetColumns.find((t) => norm(t) === norm(source));
  return match ?? '';
}

export function CreateSyncRuleModal({ open, tableType, parentRule, rule, onSave, onClose }: CreateSyncRuleModalProps) {
  const { accountsInActiveTree } = useAccount();
  const isEditing = !!rule;
  const isTransaction = tableType === 'transaction';

  const lockedSourceAccountId = isTransaction ? (parentRule?.sourceAccountId ?? rule?.sourceAccountId ?? '') : '';
  const lockedTargetAccountId = isTransaction ? (parentRule?.targetAccountId ?? rule?.targetAccountId ?? '') : '';

  // Form state
  const [sourceAccountId, setSourceAccountId] = useState(rule?.sourceAccountId ?? lockedSourceAccountId);
  const [targetAccountId, setTargetAccountId] = useState(rule?.targetAccountId ?? lockedTargetAccountId);
  const [sourceListName, setSourceListName] = useState(rule?.sourceListName ?? '');
  const [targetListName, setTargetListName] = useState(rule?.targetListName ?? '');
  const [matchColumnSource, setMatchColumnSource] = useState(rule?.matchColumnSource ?? '');
  const [matchColumnTarget, setMatchColumnTarget] = useState(rule?.matchColumnTarget ?? '');
  const [onMissing, setOnMissing] = useState<OnMissingBehaviour>(rule?.onMissing ?? 'create');
  const [triggerOnMappedOnly, setTriggerOnMappedOnly] = useState(rule?.triggerOnMappedOnly ?? false);

  // Mapping rows — one per source column, target starts empty or auto-matched
  const [mappingRows, setMappingRows] = useState<{ sourceColumn: string; targetColumn: string }[]>([]);

  // Account options
  const accountOptions = useMemo(
    () => accountsInActiveTree.map((a) => ({ value: a.id, label: a.name })),
    [accountsInActiveTree],
  );

  // Effective source/target
  const effectiveSourceId = isTransaction ? lockedSourceAccountId : sourceAccountId;
  const effectiveTargetId = isTransaction ? lockedTargetAccountId : targetAccountId;

  // Schemas
  const sourceSchema = useMemo(
    () => accountSchemas.find((s) => s.accountId === effectiveSourceId),
    [effectiveSourceId],
  );
  const targetSchema = useMemo(
    () => accountSchemas.find((s) => s.accountId === effectiveTargetId),
    [effectiveTargetId],
  );

  // Columns
  const sourceColumns = useMemo(() => {
    if (!sourceSchema) return [];
    if (!isTransaction) return sourceSchema.contactColumns;
    const list = sourceSchema.transactionalLists.find((l) => l.name === sourceListName);
    return list?.columns ?? [];
  }, [sourceSchema, isTransaction, sourceListName]);

  const targetColumns = useMemo(() => {
    if (!targetSchema) return [];
    if (!isTransaction) return targetSchema.contactColumns;
    const list = targetSchema.transactionalLists.find((l) => l.name === targetListName);
    return list?.columns ?? [];
  }, [targetSchema, isTransaction, targetListName]);

  // Target options with "— Do not sync —" at top
  const targetColumnOptions = useMemo(
    () => [
      { value: '', label: '— Do not sync —' },
      ...targetColumns.map((c) => ({ value: c, label: c })),
    ],
    [targetColumns],
  );

  // Transactional list options
  const sourceListOptions = useMemo(() => {
    if (!sourceSchema) return [];
    return sourceSchema.transactionalLists.map((l) => ({ value: l.name, label: l.name }));
  }, [sourceSchema]);
  const targetListOptions = useMemo(() => {
    if (!targetSchema) return [];
    return targetSchema.transactionalLists.map((l) => ({ value: l.name, label: l.name }));
  }, [targetSchema]);

  // Source column options for match key
  const sourceColumnOptions = useMemo(
    () => sourceColumns.map((c) => ({ value: c, label: c })),
    [sourceColumns],
  );
  const targetColumnOptionsForMatch = useMemo(
    () => targetColumns.map((c) => ({ value: c, label: c })),
    [targetColumns],
  );

  // Build mapping rows when source/target columns change
  useEffect(() => {
    if (sourceColumns.length === 0) {
      setMappingRows([]);
      return;
    }

    // If editing, populate from existing mappings
    if (isEditing && rule) {
      const existingMap = new Map(rule.columnMappings.map((m) => [m.sourceColumn, m.targetColumn]));
      setMappingRows(
        sourceColumns.map((sc) => ({
          sourceColumn: sc,
          targetColumn: existingMap.get(sc) ?? '',
        })),
      );
    } else {
      // Auto-match where possible
      setMappingRows(
        sourceColumns.map((sc) => ({
          sourceColumn: sc,
          targetColumn: autoMatchColumn(sc, targetColumns),
        })),
      );
    }
  }, [sourceColumns, targetColumns, isEditing]);

  // Handle target column change for a mapping row
  const handleMappingTargetChange = useCallback((index: number, newTarget: string) => {
    setMappingRows((prev) => prev.map((row, i) => i === index ? { ...row, targetColumn: newTarget } : row));
  }, []);

  // Derived: how many are mapped
  const mappedCount = mappingRows.filter((r) => r.targetColumn !== '').length;
  const hasDuplicateTargets = useMemo(() => {
    const targets = mappingRows.filter((r) => r.targetColumn).map((r) => r.targetColumn);
    return targets.length !== new Set(targets).size;
  }, [mappingRows]);

  // Account names
  const sourceAccountName = accountsInActiveTree.find((a) => a.id === effectiveSourceId)?.name ?? '';
  const targetAccountName = accountsInActiveTree.find((a) => a.id === effectiveTargetId)?.name ?? '';

  // Are schemas ready? (determines if mapping panel is active)
  const schemasReady = sourceColumns.length > 0 && targetColumns.length > 0;

  // Validation
  const hasAccounts = effectiveSourceId && effectiveTargetId && effectiveSourceId !== effectiveTargetId;
  const hasMatchKey = matchColumnSource && matchColumnTarget;
  const hasLists = !isTransaction || (sourceListName && targetListName);
  const isValid = hasAccounts && hasMatchKey && hasLists && !hasDuplicateTargets;

  // Save
  function handleSave() {
    if (!isValid) return;
    const now = new Date().toISOString();
    const columnMappings: ColumnMapping[] = mappingRows
      .filter((r) => r.targetColumn !== '')
      .map((r) => ({ id: generateId(), sourceColumn: r.sourceColumn, targetColumn: r.targetColumn }));

    const newRule: SyncRule = {
      id: rule?.id ?? generateId(),
      sourceAccountId: effectiveSourceId,
      targetAccountId: effectiveTargetId,
      tableType,
      sourceListName: isTransaction ? sourceListName : undefined,
      targetListName: isTransaction ? targetListName : undefined,
      parentRuleId: isTransaction ? (parentRule?.id ?? rule?.parentRuleId) : undefined,
      matchColumnSource,
      matchColumnTarget,
      onMissing,
      triggerOnMappedOnly,
      excludedCallerTypes: rule?.excludedCallerTypes ?? [],
      columnMappings,
      status: rule?.status ?? 'paused',
      createdAt: rule?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(newRule);
  }

  const modalTitle = isEditing
    ? (isTransaction ? 'Edit Transaction Sync' : 'Edit Contact Sync')
    : (isTransaction ? 'New Transaction Sync' : 'New Contact Sync');

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-[1100px] max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-border px-6 py-5 space-y-0">
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription className="sr-only">Configure sync rule settings and column mappings</DialogDescription>
          <CloseButton size="lg" onClick={onClose} />
        </DialogHeader>

        {/* Split body: settings left, mapping right */}
        <div className="flex flex-1 overflow-hidden border-t border-border">

          {/* LEFT PANEL — Settings */}
          <div className="w-[380px] shrink-0 overflow-y-auto border-r border-border px-6 py-5 space-y-6">

            {/* Source & Target */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground m-0">Source & Target</h3>

              {isTransaction ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/60 border border-border rounded-md">
                  <span className="text-xs font-medium text-foreground truncate">{sourceAccountName}</span>
                  <ArrowRight size={12} weight="bold" className="shrink-0 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground truncate">{targetAccountName}</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Source Account</Label>
                    <Combobox
                      value={sourceAccountId}
                      onValueChange={setSourceAccountId}
                      options={accountOptions.filter((a) => a.value !== targetAccountId)}
                      placeholder="Select source..."
                      searchPlaceholder="Search accounts..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Account</Label>
                    <Combobox
                      value={targetAccountId}
                      onValueChange={setTargetAccountId}
                      options={accountOptions.filter((a) => a.value !== sourceAccountId)}
                      placeholder="Select target..."
                      searchPlaceholder="Search accounts..."
                    />
                  </div>
                  {sourceAccountId && targetAccountId && sourceAccountId === targetAccountId && (
                    <p className="text-xs text-destructive m-0">Source and target must be different accounts.</p>
                  )}
                </div>
              )}
            </section>

            {/* Transactional lists (transaction only) */}
            {isTransaction && (
              <section className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground m-0">Lists</h3>
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Source List</Label>
                    <Combobox value={sourceListName} onValueChange={setSourceListName} options={sourceListOptions} placeholder="Select..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target List</Label>
                    <Combobox value={targetListName} onValueChange={setTargetListName} options={targetListOptions} placeholder="Select..." />
                  </div>
                </div>
              </section>
            )}

            {/* Match Key */}
            <section className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground m-0">Match Key</h3>
              <p className="text-xs text-muted-foreground m-0">
                {isTransaction
                  ? 'Identifies the same transaction in both lists.'
                  : 'Identifies the same contact in both accounts. Must be unique in the target.'
                }
              </p>
              <div className="space-y-2.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Source Column</Label>
                  <Combobox
                    value={matchColumnSource}
                    onValueChange={setMatchColumnSource}
                    options={sourceColumnOptions}
                    placeholder="Select..."
                    disabled={sourceColumns.length === 0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Column</Label>
                  <Combobox
                    value={matchColumnTarget}
                    onValueChange={setMatchColumnTarget}
                    options={targetColumnOptionsForMatch}
                    placeholder="Select..."
                    disabled={targetColumns.length === 0}
                  />
                </div>
              </div>
            </section>

            {/* Behaviour */}
            <section className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground m-0">Behaviour</h3>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  {isTransaction ? 'When target not found' : 'When target contact not found'}
                </Label>
                <div className="flex items-center gap-1 p-0.5 bg-secondary rounded-md w-fit">
                  <button
                    type="button"
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                      onMissing === 'create' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setOnMissing('create')}
                  >
                    Create new
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                      onMissing === 'skip' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setOnMissing('skip')}
                  >
                    Skip
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <Label className="text-xs font-medium">Mapped columns only</Label>
                  <p className="text-[11px] text-muted-foreground m-0">
                    Only trigger when a mapped column changes.
                  </p>
                </div>
                <Switch size="xs" checked={triggerOnMappedOnly} onCheckedChange={setTriggerOnMappedOnly} />
              </div>
            </section>
          </div>

          {/* RIGHT PANEL — Column Mapping Table */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {schemasReady ? (
              <>
                {/* Mapping header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <ArrowsLeftRight size={16} weight="duotone" className="text-primary" />
                    <h3 className="text-sm font-semibold text-foreground m-0">Column Mapping</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDuplicateTargets && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <WarningCircle size={14} weight="fill" />
                        Duplicate targets
                      </span>
                    )}
                    <Badge variant={mappedCount > 0 ? 'default-subtle' : 'neutral-subtle'} className="text-[10px]">
                      {mappedCount} of {sourceColumns.length} mapped
                    </Badge>
                  </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_1.2fr] items-center px-5 py-2.5 bg-secondary border-b border-border gap-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source Column</span>
                  <span className="w-5" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target Column</span>
                </div>

                {/* Mapping rows */}
                <div className="flex-1 overflow-y-auto">
                  {mappingRows.map((row, idx) => {
                    const isDuplicate = row.targetColumn !== '' &&
                      mappingRows.some((r, i) => i !== idx && r.targetColumn === row.targetColumn);

                    return (
                      <div
                        key={row.sourceColumn}
                        className={cn(
                          'grid grid-cols-[1fr_auto_1.2fr] items-center px-5 py-2 gap-3 border-b border-border/50',
                          isDuplicate && 'bg-destructive/5',
                        )}
                      >
                        {/* Source (read-only) */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm text-foreground font-medium truncate">{row.sourceColumn}</span>
                        </div>

                        {/* Arrow */}
                        <ArrowRight
                          size={12}
                          weight="bold"
                          className={cn(
                            'shrink-0',
                            row.targetColumn ? 'text-primary' : 'text-border',
                          )}
                        />

                        {/* Target (combobox) */}
                        <div className="flex items-center gap-2">
                          <Combobox
                            value={row.targetColumn}
                            onValueChange={(val) => handleMappingTargetChange(idx, val)}
                            options={targetColumnOptions}
                            placeholder="— Do not sync —"
                            status={isDuplicate ? 'error' : 'normal'}
                          />
                          {isDuplicate && (
                            <WarningCircle size={14} weight="fill" className="shrink-0 text-destructive" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Placeholder when schemas not ready */
              <div className="flex-1 flex items-center justify-center px-8">
                <div className="text-center">
                  <ArrowsLeftRight size={32} className="text-border mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground m-0">
                    {!effectiveSourceId || !effectiveTargetId
                      ? 'Select source and target accounts'
                      : isTransaction && (!sourceListName || !targetListName)
                        ? 'Select source and target lists'
                        : 'No columns available for the selected accounts'
                    }
                  </p>
                  <p className="text-xs text-tertiary-foreground mt-1 m-0">
                    Column mapping will appear here once both sides are configured.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border">
          <Button variant="secondaryGhost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {isEditing ? 'Save Changes' : (isTransaction ? 'Create Transaction Sync' : 'Create Contact Sync')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
