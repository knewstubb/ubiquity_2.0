import { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRight, ArrowsLeftRight, WarningCircle, Key } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CloseButton } from '@/components/ui/close-button';
import { SegmentedToggle } from '@/components/ui/segmented-toggle';
import { useAccount } from '../../contexts/AccountContext';
import { accountSchemas } from '../../data/account-sync';
import { SectionDivider } from '@/components/composed/section-divider';
import type { SyncRule, ColumnMapping, SyncTableType, OnMissingBehaviour } from '../../models/account-sync';
import { cn } from '@/lib/utils';

interface CreateSyncRuleModalProps {
  open: boolean;
  tableType: SyncTableType;
  parentRule?: SyncRule;
  rule?: SyncRule;
  onSave: (rule: SyncRule) => void;
  onClose: () => void;
  existingRules?: SyncRule[];
  availableAccounts?: { id: string; name: string }[];
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

export function CreateSyncRuleModal({ open, tableType, parentRule, rule, onSave, onClose, existingRules = [], availableAccounts }: CreateSyncRuleModalProps) {
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

  // Account options — use provided availableAccounts (from customer tree) or fall back to active tree
  const accountPool = availableAccounts ?? accountsInActiveTree;
  const accountOptions = useMemo(
    () => accountPool.map((a) => ({ value: a.id, label: a.name })),
    [accountPool],
  );

  // Effective source/target
  const effectiveSourceId = isTransaction ? lockedSourceAccountId : sourceAccountId;
  const effectiveTargetId = isTransaction ? lockedTargetAccountId : targetAccountId;

  // Detect duplicate source/target combo
  const isDuplicateCombo = useMemo(() => {
    if (!effectiveSourceId || !effectiveTargetId) return false;
    return existingRules.some((r) =>
      r.id !== rule?.id &&
      r.tableType === tableType &&
      r.sourceAccountId === effectiveSourceId &&
      r.targetAccountId === effectiveTargetId,
    );
  }, [effectiveSourceId, effectiveTargetId, existingRules, rule?.id, tableType]);

  // Detect bidirectional sync (reverse of an existing rule)
  const isBidirectional = useMemo(() => {
    if (!effectiveSourceId || !effectiveTargetId) return false;
    return existingRules.some((r) =>
      r.id !== rule?.id &&
      r.tableType === tableType &&
      r.sourceAccountId === effectiveTargetId &&
      r.targetAccountId === effectiveSourceId,
    );
  }, [effectiveSourceId, effectiveTargetId, existingRules, rule?.id, tableType]);

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

  // Example values for source columns
  const sourceExamples = useMemo<Record<string, string>>(() => {
    if (!sourceSchema) return {};
    if (!isTransaction) return sourceSchema.contactExamples ?? {};
    const list = sourceSchema.transactionalLists.find((l) => l.name === sourceListName);
    return list?.examples ?? {};
  }, [sourceSchema, isTransaction, sourceListName]);

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

  // Sync match key selection into the mapping row (lock it)
  useEffect(() => {
    if (!matchColumnSource || !matchColumnTarget) return;
    setMappingRows((prev) =>
      prev.map((row) =>
        row.sourceColumn === matchColumnSource ? { ...row, targetColumn: matchColumnTarget } : row,
      ),
    );
  }, [matchColumnSource, matchColumnTarget]);

  // Handle target column change for a mapping row
  const handleMappingTargetChange = useCallback((index: number, newTarget: string) => {
    setMappingRows((prev) => prev.map((row, i) => i === index ? { ...row, targetColumn: newTarget } : row));
  }, []);

  // Derived: how many are mapped
  const mappedCount = mappingRows.filter((r) => r.targetColumn !== '').length;

  // Sort rows: match key row first (as soon as source is selected), then the rest in original order
  const sortedMappingRows = useMemo(() => {
    if (!matchColumnSource) return mappingRows;
    const matchRow = mappingRows.find((r) => r.sourceColumn === matchColumnSource);
    const rest = mappingRows.filter((r) => r.sourceColumn !== matchColumnSource);
    return matchRow ? [matchRow, ...rest] : mappingRows;
  }, [mappingRows, matchColumnSource]);

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
  const isValid = hasAccounts && hasMatchKey && hasLists && !hasDuplicateTargets && !isDuplicateCombo;

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
      <DialogContent className="max-w-[1380px] max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-border px-6 py-5 space-y-0">
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription className="sr-only">Configure sync rule settings and column mappings</DialogDescription>
          <CloseButton size="lg" onClick={onClose} />
        </DialogHeader>

        {/* Split body: settings left, mapping right */}
        <div className="flex flex-1 overflow-hidden border-t border-border">

          {/* LEFT PANEL — Settings */}
          <div className="w-[380px] shrink-0 overflow-y-auto border-r border-border px-6 py-6">

            {/* Accounts section */}
            <SectionDivider label="Accounts" className="mb-0" />
            <div className="mt-3 flex flex-col gap-3">
              {isTransaction ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-semibold text-primary truncate">{sourceAccountName}</span>
                  <ArrowRight size={14} weight="bold" className="shrink-0 text-primary" />
                  <span className="text-sm font-semibold text-primary truncate">{targetAccountName}</span>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="source-account">Source Account</Label>
                    <Combobox
                      value={sourceAccountId}
                      onValueChange={setSourceAccountId}
                      options={accountOptions.filter((a) => a.value !== targetAccountId)}
                      placeholder="Select source..."
                      searchPlaceholder="Search accounts..."
                      disabled={isEditing}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="target-account">Target Account</Label>
                    <Combobox
                      value={targetAccountId}
                      onValueChange={setTargetAccountId}
                      options={accountOptions.filter((a) => a.value !== sourceAccountId)}
                      placeholder="Select target..."
                      searchPlaceholder="Search accounts..."
                      disabled={isEditing}
                    />
                  </div>
                  {sourceAccountId && targetAccountId && sourceAccountId === targetAccountId && (
                    <p className="text-xs text-destructive m-0">Source and target must be different accounts.</p>
                  )}
                  {isDuplicateCombo && (
                    <p className="text-xs text-destructive m-0">A sync rule with this source/target combination already exists.</p>
                  )}
                  {isBidirectional && !isDuplicateCombo && (
                    <p className="text-xs text-amber-600 m-0">A reverse sync already exists for these accounts. While bidirectional syncs are possible, we don't recommend them.</p>
                  )}
                </>
              )}
            </div>

            {/* Transactional lists (transaction only) */}
            {isTransaction && (
              <>
                <div className="mt-6">
                  <SectionDivider label="Lists" className="mb-0" />
                </div>
                <div className="mt-3 flex flex-col gap-3">
                  <div className="space-y-1.5">
                    <Label>Source List</Label>
                    <Combobox value={sourceListName} onValueChange={setSourceListName} options={sourceListOptions} placeholder="Select..." disabled={isEditing} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target List</Label>
                    <Combobox value={targetListName} onValueChange={setTargetListName} options={targetListOptions} placeholder="Select..." disabled={isEditing} />
                  </div>
                </div>
              </>
            )}

            {/* Match Key section — 24px gap above */}
            <div className="mt-6">
              <SectionDivider label="Match Key" className="mb-0" />
            </div>
            <p className="text-xs text-muted-foreground m-0 text-center mt-3">
              {isTransaction
                ? 'Identifies the same transaction in both lists.'
                : 'Identifies the same contact in both accounts. Must be unique in the target.'
              }
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <div className="space-y-1.5">
                <Label>Source Column</Label>
                <Combobox
                  value={matchColumnSource}
                  onValueChange={setMatchColumnSource}
                  options={sourceColumnOptions}
                  placeholder="Select..."
                  disabled={sourceColumns.length === 0 || isEditing}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Target Column</Label>
                <Combobox
                  value={matchColumnTarget}
                  onValueChange={setMatchColumnTarget}
                  options={targetColumnOptionsForMatch}
                  placeholder="Select..."
                  disabled={targetColumns.length === 0 || isEditing}
                />
              </div>
            </div>

            {/* Behaviour section — 24px gap above */}
            <div className="mt-6">
              <SectionDivider label="Behaviour" className="mb-0" />
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {/* On Missing */}
              <div>
                <Label className="text-sm font-semibold">When target record not found</Label>
                <p className="text-xs text-muted-foreground m-0 mt-0.5">Choose what happens when no matching record exists.</p>
                <SegmentedToggle
                  className="mt-2"
                  value={onMissing}
                  onValueChange={(val) => setOnMissing(val as OnMissingBehaviour)}
                  options={[
                    { value: 'create', label: 'Create new' },
                    { value: 'skip', label: 'Skip missing' },
                  ]}
                  disabled={isEditing}
                />
              </div>

              {/* Trigger Scope */}
              <div>
                <Label className="text-sm font-semibold">Trigger scope</Label>
                <p className="text-xs text-muted-foreground m-0 mt-0.5">A mapped column is any column you've linked to a field.</p>
                <SegmentedToggle
                  className="mt-2"
                  value={triggerOnMappedOnly ? 'mapped' : 'any'}
                  onValueChange={(val) => setTriggerOnMappedOnly(val === 'mapped')}
                  options={[
                    { value: 'any', label: 'Any column' },
                    { value: 'mapped', label: 'Mapped only' },
                  ]}
                  disabled={isEditing}
                />
              </div>
            </div>

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
                <div className="grid grid-cols-[1fr_40px_1.2fr_40px_1fr] items-center px-4 py-3 bg-secondary border-b border-border">
                  <span className="text-sm font-semibold text-muted-foreground">Source Column</span>
                  <span />
                  <span className="text-sm font-semibold text-muted-foreground">Target Column</span>
                  <span />
                  <span className="text-sm font-semibold text-muted-foreground">Example Values</span>
                </div>

                {/* Mapping rows */}
                <div className="flex-1 overflow-y-auto">
                  {sortedMappingRows.map((row) => {
                    const idx = mappingRows.findIndex((r) => r.sourceColumn === row.sourceColumn);
                    const isDuplicate = row.targetColumn !== '' &&
                      mappingRows.some((r, i) => i !== idx && r.targetColumn === row.targetColumn);
                    const exampleValue = sourceExamples[row.sourceColumn] ?? '';
                    const isMatchKeyRow = row.sourceColumn === matchColumnSource;

                    return (
                      <div
                        key={row.sourceColumn}
                        className={cn(
                          'grid grid-cols-[1fr_40px_1.2fr_40px_1fr] items-center px-4 py-2 border-b border-border/50',
                          isMatchKeyRow && 'bg-primary/5 border-b-border',
                        )}
                      >
                        {/* Source (read-only) */}
                        <span className={cn(
                          'text-sm font-normal text-foreground truncate flex items-center gap-1.5',
                          isDuplicate && 'text-destructive font-medium',
                          isMatchKeyRow && 'font-semibold text-primary',
                        )}>
                          {isMatchKeyRow && <Key size={14} weight="fill" className="shrink-0" />}
                          {row.sourceColumn}
                        </span>

                        {/* Arrow */}
                        <span className={cn(
                          'text-sm text-center select-none',
                          isDuplicate ? 'text-destructive' : row.targetColumn ? 'text-primary' : 'text-tertiary-foreground',
                        )} aria-hidden="true">→</span>

                        {/* Target — plain text when match key, combobox otherwise */}
                        <div className="flex items-center gap-2">
                          {isMatchKeyRow ? (
                            <span className="text-sm font-semibold text-primary truncate px-3 h-9 flex items-center">{row.targetColumn}</span>
                          ) : (
                            <Combobox
                              value={row.targetColumn}
                              onValueChange={(val) => handleMappingTargetChange(idx, val)}
                              options={targetColumnOptions}
                              placeholder="— Do not sync —"
                              status={isDuplicate ? 'error' : 'normal'}
                            />
                          )}
                        </div>

                        {/* Equals */}
                        <span className={cn(
                          'text-sm text-center select-none',
                          isMatchKeyRow ? 'text-primary' : 'text-tertiary-foreground',
                        )} aria-hidden="true">{row.targetColumn ? '=' : ''}</span>

                        {/* Example value or status label */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isDuplicate ? (
                            <>
                              <WarningCircle size={16} weight="regular" className="shrink-0 text-destructive" />
                              <span className="text-xs text-destructive">Duplicate mapping</span>
                            </>
                          ) : (
                            <span className={cn(
                              'text-sm truncate',
                              isMatchKeyRow ? 'text-primary' : 'text-tertiary-foreground',
                            )} title={row.targetColumn ? exampleValue : ''}>
                              {row.targetColumn ? (exampleValue || '—') : ''}
                            </span>
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
