import { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRight, ArrowsLeftRight, WarningCircle, Key, Asterisk, Plus, Trash } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Combobox } from '@/components/molecules/combobox';
import { Label } from '@/components/atoms/label';
import { Badge } from '@/components/atoms/badge';
import { CloseButton } from '@/components/atoms/close-button';
import { SegmentedToggle } from '@/components/molecules/segmented-toggle';
import { useAccount } from '../../contexts/AccountContext';
import { accountSchemas } from '../../data/account-sync';
import { SectionDivider } from '@/components/molecules/section-divider';
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

  // Mapping rows — starts with required fields pre-populated, additional rows added via "Add mapping" button
  // Each row: { sourceColumn, targetColumn, isRequired } where isRequired rows have fixed target
  const [mappingRows, setMappingRows] = useState<{ sourceColumn: string; targetColumn: string; isRequired: boolean }[]>([]);

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

  // Example values for target columns
  const targetExamples = useMemo<Record<string, string>>(() => {
    if (!targetSchema) return {};
    if (!isTransaction) return targetSchema.contactExamples ?? {};
    const list = targetSchema.transactionalLists.find((l) => l.name === targetListName);
    return list?.examples ?? {};
  }, [targetSchema, isTransaction, targetListName]);

  // Required columns in the target (from target schema)
  const targetRequiredColumns = useMemo<Set<string>>(() => {
    if (!targetSchema || isTransaction) return new Set();
    return new Set(targetSchema.requiredColumns ?? []);
  }, [targetSchema, isTransaction]);

  // Unmapped required columns — target required columns that have no source mapped to them
  const unmappedRequiredColumns = useMemo<Set<string>>(() => {
    if (targetRequiredColumns.size === 0) return new Set();
    const mappedTargets = new Set(mappingRows.filter((r) => r.targetColumn).map((r) => r.targetColumn));
    const unmapped = new Set<string>();
    targetRequiredColumns.forEach((col) => {
      if (!mappedTargets.has(col)) unmapped.add(col);
    });
    return unmapped;
  }, [targetRequiredColumns, mappingRows]);

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

  // Build mapping rows when source/target columns change — only required fields are pre-populated
  useEffect(() => {
    if (targetColumns.length === 0) {
      setMappingRows([]);
      return;
    }

    // If editing, populate from existing mappings
    if (isEditing && rule) {
      const existingMappings = rule.columnMappings.map((m) => ({
        sourceColumn: m.sourceColumn,
        targetColumn: m.targetColumn,
        isRequired: targetRequiredColumns.has(m.targetColumn),
      }));
      // Add any unmapped required columns at the top
      const mappedTargets = new Set(existingMappings.map((m) => m.targetColumn));
      const unmappedRequired = Array.from(targetRequiredColumns)
        .filter((col) => !mappedTargets.has(col))
        .map((col) => ({
          sourceColumn: autoMatchColumn(col, sourceColumns),
          targetColumn: col,
          isRequired: true,
        }));
      // Sort: required fields first, then non-required
      const sortedMappings = [
        ...existingMappings.filter((m) => m.isRequired),
        ...unmappedRequired,
        ...existingMappings.filter((m) => !m.isRequired),
      ];
      setMappingRows(sortedMappings);
    } else {
      // New rule: only pre-populate required fields with auto-matched sources
      const requiredRows = Array.from(targetRequiredColumns).map((targetCol) => ({
        sourceColumn: autoMatchColumn(targetCol, sourceColumns),
        targetColumn: targetCol,
        isRequired: true,
      }));
      setMappingRows(requiredRows);
    }
  }, [sourceColumns, targetColumns, isEditing, targetRequiredColumns]);

  // Sync match key selection into the mapping row (lock it) — also add as required if not present
  useEffect(() => {
    if (!matchColumnSource || !matchColumnTarget) return;
    setMappingRows((prev) => {
      // Check if match key target is already in the list
      const hasMatchKeyRow = prev.some((row) => row.targetColumn === matchColumnTarget);
      if (hasMatchKeyRow) {
        // Update the existing row with the match key source
        return prev.map((row) =>
          row.targetColumn === matchColumnTarget 
            ? { ...row, sourceColumn: matchColumnSource, isRequired: true } 
            : row
        );
      } else {
        // Add match key row at the top as required
        return [
          { sourceColumn: matchColumnSource, targetColumn: matchColumnTarget, isRequired: true },
          ...prev,
        ];
      }
    });
  }, [matchColumnSource, matchColumnTarget]);

  // Handle source column change for a mapping row
  const handleMappingSourceChange = useCallback((index: number, newSource: string) => {
    setMappingRows((prev) => prev.map((row, i) => i === index ? { ...row, sourceColumn: newSource } : row));
  }, []);

  // Handle target column change for a non-required mapping row
  const handleMappingTargetChange = useCallback((index: number, newTarget: string) => {
    setMappingRows((prev) => prev.map((row, i) => i === index ? { ...row, targetColumn: newTarget } : row));
  }, []);

  // Add a new mapping row (both source and target are selectable)
  const handleAddMappingRow = useCallback(() => {
    setMappingRows((prev) => [...prev, { sourceColumn: '', targetColumn: '', isRequired: false }]);
  }, []);

  // Remove a non-required mapping row
  const handleRemoveMappingRow = useCallback((index: number) => {
    setMappingRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Derived: how many are mapped
  const mappedCount = mappingRows.filter((r) => r.targetColumn !== '').length;

  // Sort rows: match key row first, then required fields, then additional mappings
  const sortedMappingRows = useMemo(() => {
    // Only find a match row if matchColumnTarget is actually set
    const matchRow = matchColumnTarget 
      ? mappingRows.find((r) => r.targetColumn === matchColumnTarget)
      : undefined;
    const requiredRows = mappingRows.filter((r) => r.isRequired && r.targetColumn !== matchColumnTarget);
    const additionalRows = mappingRows.filter((r) => !r.isRequired);
    return [
      ...(matchRow ? [matchRow] : []),
      ...requiredRows,
      ...additionalRows,
    ];
  }, [mappingRows, matchColumnTarget]);

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
                    <Label htmlFor="source-account">Source account</Label>
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
                    <Label htmlFor="target-account">Target account</Label>
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
                    <Label>Source list</Label>
                    <Combobox value={sourceListName} onValueChange={setSourceListName} options={sourceListOptions} placeholder="Select..." disabled={isEditing} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target list</Label>
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
                <Label>Source column</Label>
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
                    {unmappedRequiredColumns.size > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Asterisk size={14} weight="bold" />
                        {unmappedRequiredColumns.size} required unmapped
                      </span>
                    )}
                    {hasDuplicateTargets && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <WarningCircle size={14} weight="fill" />
                        Duplicate targets
                      </span>
                    )}
                    <Badge variant={mappedCount > 0 ? 'default-subtle' : 'neutral-subtle'} className="text-[10px]">
                      {mappedCount} mapped
                    </Badge>
                  </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_40px_1fr_40px_1fr_40px] items-center px-6 py-3 bg-secondary border-b border-border">
                  <span className="text-sm font-semibold text-muted-foreground">Source Column</span>
                  <span />
                  <span className="text-sm font-semibold text-muted-foreground">Target Column</span>
                  <span />
                  <span className="text-sm font-semibold text-muted-foreground">Example Values</span>
                  <span />
                </div>

                {/* Mapping rows */}
                <div className="flex-1 overflow-y-auto">
                  {sortedMappingRows.map((row, displayIndex) => {
                    const actualIndex = mappingRows.findIndex(
                      (r) => r.sourceColumn === row.sourceColumn && r.targetColumn === row.targetColumn
                    );
                    const isDuplicate = row.targetColumn !== '' &&
                      mappingRows.filter((r) => r.targetColumn === row.targetColumn).length > 1;
                    const exampleValue = targetExamples[row.targetColumn] ?? '';
                    // Match key row: must have both a target and match the selected match key target
                    const isMatchKeyRow = row.targetColumn !== '' && row.targetColumn === matchColumnTarget;

                    return (
                      <div
                        key={`${row.targetColumn}-${displayIndex}`}
                        className={cn(
                          'grid grid-cols-[1fr_40px_1fr_40px_1fr_40px] items-center px-6 py-2 border-b border-border/50',
                          isMatchKeyRow && 'bg-primary/5 border-b-border',
                        )}
                      >
                        {/* Source — combobox for all rows */}
                        <div className="flex items-center gap-2 h-9">
                          {isMatchKeyRow ? (
                            <span className="text-sm font-semibold text-primary truncate flex items-center gap-1.5">
                              <Key size={14} weight="fill" className="shrink-0" />
                              {row.sourceColumn}
                            </span>
                          ) : (
                            <Combobox
                              value={row.sourceColumn}
                              onValueChange={(val) => handleMappingSourceChange(actualIndex, val)}
                              options={[
                                { value: '', label: '— Select source —' },
                                ...sourceColumns.map((c) => ({ value: c, label: c })),
                              ]}
                              placeholder="— Select source —"
                            />
                          )}
                        </div>

                        {/* Arrow */}
                        <span className={cn(
                          'text-sm text-center select-none',
                          isDuplicate ? 'text-destructive' : row.sourceColumn ? 'text-primary' : 'text-tertiary-foreground',
                        )} aria-hidden="true">→</span>

                        {/* Target — fixed text for required rows, combobox for added rows */}
                        <div className="flex items-center gap-2 h-9">
                          {row.isRequired ? (
                            <span className={cn(
                              'text-sm font-normal text-foreground truncate flex items-center gap-1.5',
                              isMatchKeyRow && 'font-semibold text-primary',
                            )}>
                              {row.targetColumn}
                              <Asterisk size={12} weight="bold" className="shrink-0 text-amber-600" />
                            </span>
                          ) : (
                            <Combobox
                              value={row.targetColumn}
                              onValueChange={(val) => handleMappingTargetChange(actualIndex, val)}
                              options={[
                                { value: '', label: '— Select target —' },
                                ...targetColumns
                                  .filter((c) => !targetRequiredColumns.has(c)) // Exclude required columns from dropdown
                                  .map((c) => ({ value: c, label: c })),
                              ]}
                              placeholder="— Select target —"
                              status={isDuplicate ? 'error' : 'normal'}
                            />
                          )}
                        </div>

                        {/* Equals */}
                        <span className={cn(
                          'text-sm text-center select-none',
                          isMatchKeyRow ? 'text-primary' : 'text-tertiary-foreground',
                        )} aria-hidden="true">{row.sourceColumn && row.targetColumn ? '=' : ''}</span>

                        {/* Example value or status label */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isDuplicate ? (
                            <>
                              <WarningCircle size={16} weight="regular" className="shrink-0 text-destructive" />
                              <span className="text-xs text-destructive">Duplicate</span>
                            </>
                          ) : (
                            <span className={cn(
                              'text-sm truncate',
                              isMatchKeyRow ? 'text-primary' : 'text-tertiary-foreground',
                            )} title={exampleValue}>
                              {exampleValue || '—'}
                            </span>
                          )}
                        </div>

                        {/* Delete button — only for non-required rows */}
                        <div className="flex items-center justify-center">
                          {!row.isRequired && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMappingRow(actualIndex)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-destructive/10"
                              title="Remove mapping"
                            >
                              <Trash size={16} weight="regular" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add mapping button */}
                  <div className="px-6 py-3 border-b border-border/50">
                    <button
                      type="button"
                      onClick={handleAddMappingRow}
                      className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus size={16} weight="bold" />
                      Add mapping
                    </button>
                  </div>
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
                  <p className="text-2xs text-tertiary-foreground mt-1 m-0">
                    Column mapping will appear here once both sides are configured.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border justify-end">
          <div className="flex items-center gap-3">
            <Button variant="secondaryGhost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!isValid}>
              {isEditing ? 'Save Changes' : (isTransaction ? 'Create Transaction Sync' : 'Create Contact Sync')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
