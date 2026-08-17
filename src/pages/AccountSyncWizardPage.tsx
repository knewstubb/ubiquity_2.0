import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowsLeftRight, WarningCircle, Key, Asterisk, Plus, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/atoms/button';
import { Combobox } from '@/components/molecules/combobox';
import { Label } from '@/components/atoms/label';
import { Badge } from '@/components/atoms/badge';
import { SegmentedToggle } from '@/components/molecules/segmented-toggle';
import { AlertDialogComposed } from '@/components/organisms/alert-dialog-composed';
import { SectionDivider } from '@/components/molecules/section-divider';
import { useAccount } from '@/contexts/AccountContext';
import { accountSchemas } from '@/data/account-sync';
import { cn } from '@/lib/utils';
import type { SyncRule, ColumnMapping, SyncTableType, OnMissingBehaviour } from '@/models/account-sync';
import type { Account } from '@/models/account';

interface LocationState {
  tableType: SyncTableType;
  parentRule?: SyncRule;
  editRule?: SyncRule;
  customerAccountId: string;
  existingRules: SyncRule[];
  availableAccounts: Account[];
}

function generateId(): string {
  return `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function autoMatchColumn(source: string, targetColumns: string[]): string {
  if (targetColumns.includes(source)) return source;
  const norm = (s: string) => s.toLowerCase().replace(/[_\-\s]/g, '');
  const match = targetColumns.find((t) => norm(t) === norm(source));
  return match ?? '';
}

export default function AccountSyncWizardPage() {
  const { parentRuleId, ruleId } = useParams<{ parentRuleId?: string; ruleId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accountsInActiveTree } = useAccount();

  const state = location.state as LocationState | undefined;
  const tableType = state?.tableType ?? 'contact';
  const parentRule = state?.parentRule;
  const editRule = state?.editRule;
  const existingRules = state?.existingRules ?? [];
  const availableAccounts = state?.availableAccounts ?? [];

  const isEditing = !!editRule || !!ruleId;
  const isTransaction = tableType === 'transaction';

  const lockedSourceAccountId = isTransaction ? (parentRule?.sourceAccountId ?? editRule?.sourceAccountId ?? '') : '';
  const lockedTargetAccountId = isTransaction ? (parentRule?.targetAccountId ?? editRule?.targetAccountId ?? '') : '';

  // Form state
  const [sourceAccountId, setSourceAccountId] = useState(editRule?.sourceAccountId ?? lockedSourceAccountId);
  const [targetAccountId, setTargetAccountId] = useState(editRule?.targetAccountId ?? lockedTargetAccountId);
  const [sourceListName, setSourceListName] = useState(editRule?.sourceListName ?? '');
  const [targetListName, setTargetListName] = useState(editRule?.targetListName ?? '');
  const [matchColumnSource, setMatchColumnSource] = useState(editRule?.matchColumnSource ?? '');
  const [matchColumnTarget, setMatchColumnTarget] = useState(editRule?.matchColumnTarget ?? '');
  const [onMissing, setOnMissing] = useState<OnMissingBehaviour>(editRule?.onMissing ?? 'create');
  const [triggerOnMappedOnly, setTriggerOnMappedOnly] = useState(editRule?.triggerOnMappedOnly ?? false);
  const [mappingRows, setMappingRows] = useState<{ sourceColumn: string; targetColumn: string; isRequired: boolean }[]>([]);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const accountPool = availableAccounts.length > 0 ? availableAccounts : accountsInActiveTree;
  const accountOptions = useMemo(() => accountPool.map((a) => ({ value: a.id, label: a.name })), [accountPool]);

  const effectiveSourceId = isTransaction ? lockedSourceAccountId : sourceAccountId;
  const effectiveTargetId = isTransaction ? lockedTargetAccountId : targetAccountId;

  const isDuplicateCombo = useMemo(() => {
    if (!effectiveSourceId || !effectiveTargetId) return false;
    return existingRules.some((r) =>
      r.id !== editRule?.id && r.tableType === tableType &&
      r.sourceAccountId === effectiveSourceId && r.targetAccountId === effectiveTargetId,
    );
  }, [effectiveSourceId, effectiveTargetId, existingRules, editRule?.id, tableType]);

  const isBidirectional = useMemo(() => {
    if (!effectiveSourceId || !effectiveTargetId) return false;
    return existingRules.some((r) =>
      r.id !== editRule?.id && r.tableType === tableType &&
      r.sourceAccountId === effectiveTargetId && r.targetAccountId === effectiveSourceId,
    );
  }, [effectiveSourceId, effectiveTargetId, existingRules, editRule?.id, tableType]);

  const sourceSchema = useMemo(() => accountSchemas.find((s) => s.accountId === effectiveSourceId), [effectiveSourceId]);
  const targetSchema = useMemo(() => accountSchemas.find((s) => s.accountId === effectiveTargetId), [effectiveTargetId]);

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

  const sourceExamples = useMemo<Record<string, string>>(() => {
    if (!sourceSchema) return {};
    if (!isTransaction) return sourceSchema.contactExamples ?? {};
    const list = sourceSchema.transactionalLists.find((l) => l.name === sourceListName);
    return list?.examples ?? {};
  }, [sourceSchema, isTransaction, sourceListName]);

  const targetExamples = useMemo<Record<string, string>>(() => {
    if (!targetSchema) return {};
    if (!isTransaction) return targetSchema.contactExamples ?? {};
    const list = targetSchema.transactionalLists.find((l) => l.name === targetListName);
    return list?.examples ?? {};
  }, [targetSchema, isTransaction, targetListName]);

  const targetRequiredColumns = useMemo<Set<string>>(() => {
    if (!targetSchema || isTransaction) return new Set();
    return new Set(targetSchema.requiredColumns ?? []);
  }, [targetSchema, isTransaction]);

  const targetDefaultColumns = useMemo<Set<string>>(() => {
    if (!targetSchema || isTransaction) return new Set();
    return new Set(Object.keys(targetSchema.defaultColumnValues ?? {}));
  }, [targetSchema, isTransaction]);

  // Required columns that have no default value — these MUST be mapped
  const targetRequiredWithoutDefaults = useMemo<Set<string>>(() => {
    const required = new Set<string>();
    targetRequiredColumns.forEach((col) => {
      if (!targetDefaultColumns.has(col)) required.add(col);
    });
    return required;
  }, [targetRequiredColumns, targetDefaultColumns]);

  const unmappedRequiredColumns = useMemo<Set<string>>(() => {
    if (targetRequiredWithoutDefaults.size === 0) return new Set();
    // A required column is "mapped" only if it has BOTH a target column AND a source column
    const fullyMappedTargets = new Set(mappingRows.filter((r) => r.targetColumn && r.sourceColumn).map((r) => r.targetColumn));
    const unmapped = new Set<string>();
    targetRequiredWithoutDefaults.forEach((col) => { if (!fullyMappedTargets.has(col)) unmapped.add(col); });
    return unmapped;
  }, [targetRequiredWithoutDefaults, mappingRows]);

  const sourceListOptions = useMemo(() => sourceSchema?.transactionalLists.map((l) => ({ value: l.name, label: l.name })) ?? [], [sourceSchema]);
  const targetListOptions = useMemo(() => targetSchema?.transactionalLists.map((l) => ({ value: l.name, label: l.name })) ?? [], [targetSchema]);
  const sourceColumnOptions = useMemo(() => sourceColumns.map((c) => ({ value: c, label: c })), [sourceColumns]);
  const targetColumnOptionsForMatch = useMemo(() => targetColumns.map((c) => ({ value: c, label: c })), [targetColumns]);

  // Build mapping rows when source/target columns change
  useEffect(() => {
    if (targetColumns.length === 0) { setMappingRows([]); return; }
    if (isEditing && editRule) {
      const existingMappings = editRule.columnMappings.map((m) => ({
        sourceColumn: m.sourceColumn, targetColumn: m.targetColumn,
        isRequired: targetRequiredWithoutDefaults.has(m.targetColumn),
      }));
      const mappedTargets = new Set(existingMappings.map((m) => m.targetColumn));
      // Only auto-add required columns that don't have defaults
      const unmappedRequired = Array.from(targetRequiredWithoutDefaults)
        .filter((col) => !mappedTargets.has(col))
        .map((col) => ({ sourceColumn: autoMatchColumn(col, sourceColumns), targetColumn: col, isRequired: true }));
      setMappingRows([...existingMappings.filter((m) => m.isRequired), ...unmappedRequired, ...existingMappings.filter((m) => !m.isRequired)]);
    } else {
      // Only auto-add required columns that don't have defaults
      const requiredRows = Array.from(targetRequiredWithoutDefaults).map((targetCol) => ({
        sourceColumn: autoMatchColumn(targetCol, sourceColumns), targetColumn: targetCol, isRequired: true,
      }));
      setMappingRows(requiredRows);
    }
  }, [sourceColumns, targetColumns, isEditing, targetRequiredWithoutDefaults]);

  useEffect(() => {
    if (!matchColumnSource || !matchColumnTarget) return;
    setMappingRows((prev) => {
      const hasMatchKeyRow = prev.some((row) => row.targetColumn === matchColumnTarget);
      if (hasMatchKeyRow) {
        return prev.map((row) => row.targetColumn === matchColumnTarget ? { ...row, sourceColumn: matchColumnSource, isRequired: true } : row);
      }
      return [{ sourceColumn: matchColumnSource, targetColumn: matchColumnTarget, isRequired: true }, ...prev];
    });
  }, [matchColumnSource, matchColumnTarget]);

  const handleMappingSourceChange = useCallback((index: number, newSource: string) => {
    setMappingRows((prev) => prev.map((row, i) => i === index ? { ...row, sourceColumn: newSource } : row));
  }, []);
  const handleMappingTargetChange = useCallback((index: number, newTarget: string) => {
    setMappingRows((prev) => prev.map((row, i) => i === index ? { ...row, targetColumn: newTarget } : row));
  }, []);
  const handleAddMappingRow = useCallback(() => { setMappingRows((prev) => [...prev, { sourceColumn: '', targetColumn: '', isRequired: false }]); }, []);
  const handleRemoveMappingRow = useCallback((index: number) => { setMappingRows((prev) => prev.filter((_, i) => i !== index)); }, []);

  const mappedCount = mappingRows.filter((r) => r.targetColumn !== '').length;
  const sortedMappingRows = useMemo(() => {
    const matchRow = matchColumnTarget ? mappingRows.find((r) => r.targetColumn === matchColumnTarget) : undefined;
    const requiredRows = mappingRows.filter((r) => r.isRequired && r.targetColumn !== matchColumnTarget);
    const additionalRows = mappingRows.filter((r) => !r.isRequired);
    return [...(matchRow ? [matchRow] : []), ...requiredRows, ...additionalRows];
  }, [mappingRows, matchColumnTarget]);

  const hasDuplicateTargets = useMemo(() => {
    const targets = mappingRows.filter((r) => r.targetColumn).map((r) => r.targetColumn);
    return targets.length !== new Set(targets).size;
  }, [mappingRows]);

  const sourceAccountName = accountsInActiveTree.find((a) => a.id === effectiveSourceId)?.name ?? '';
  const targetAccountName = accountsInActiveTree.find((a) => a.id === effectiveTargetId)?.name ?? '';
  const schemasReady = sourceColumns.length > 0 && targetColumns.length > 0;
  const hasAccounts = effectiveSourceId && effectiveTargetId && effectiveSourceId !== effectiveTargetId;
  const hasMatchKey = matchColumnSource && matchColumnTarget;
  const hasLists = !isTransaction || (sourceListName && targetListName);
  const allRequiredMapped = unmappedRequiredColumns.size === 0;
  const isValid = hasAccounts && hasMatchKey && hasLists && !hasDuplicateTargets && !isDuplicateCombo && allRequiredMapped;

  function handleClose() { navigate('/admin/account-sync'); }
  function handleCloseClick() { setShowDiscardConfirm(true); }

  function handleSave() {
    if (!isValid) return;
    const now = new Date().toISOString();
    const columnMappings: ColumnMapping[] = mappingRows.filter((r) => r.targetColumn !== '')
      .map((r) => ({ id: generateId(), sourceColumn: r.sourceColumn, targetColumn: r.targetColumn }));
    const newRule: SyncRule = {
      id: editRule?.id ?? generateId(), sourceAccountId: effectiveSourceId, targetAccountId: effectiveTargetId,
      tableType, sourceListName: isTransaction ? sourceListName : undefined, targetListName: isTransaction ? targetListName : undefined,
      parentRuleId: isTransaction ? (parentRule?.id ?? editRule?.parentRuleId) : undefined,
      matchColumnSource, matchColumnTarget, onMissing, triggerOnMappedOnly,
      excludedCallerTypes: editRule?.excludedCallerTypes ?? [], columnMappings,
      status: editRule?.status ?? 'paused', createdAt: editRule?.createdAt ?? now, updatedAt: now,
    };
    sessionStorage.setItem('account-sync-saved-rule', JSON.stringify(newRule));
    handleClose();
  }

  const modePrefix = isEditing ? 'Edit' : 'New';
  const syncTypeLabel = isTransaction ? 'Transaction Sync' : 'Contact Sync';
  const modalTitle = `${modePrefix} ${syncTypeLabel}`;
  const showAccountContext = sourceAccountName && targetAccountName;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background" data-testid="account-sync-wizard-page">
      {/* Top Bar with Back Button */}
      <div className="shrink-0 h-14 border-b border-border bg-card flex items-center px-6 gap-6">
        {/* Left: Back link — Base/Semi-bold (14px) */}
        <Button
          variant="ghost"
          onClick={handleCloseClick}
          className="text-primary hover:text-primary hover:bg-accent shrink-0"
        >
          <ArrowLeft size={20} weight="bold" />
          <span>Back</span>
        </Button>

        {/* Vertical separator — after Back button */}
        <div className="w-px h-5 bg-border-strong shrink-0" />

        {/* Title — Base/Semi-bold (14px) */}
        <h1 className="text-base font-semibold text-foreground m-0">{modalTitle}</h1>

        {/* Account context — Small/Semi-bold (12px) — only show when accounts are selected */}
        {showAccountContext && (
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground shrink-0">
            <span className="truncate max-w-[180px]">{sourceAccountName}</span>
            <ArrowRight size={14} weight="regular" className="shrink-0" />
            <span className="truncate max-w-[180px]">{targetAccountName}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 p-6">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col flex-1 min-h-0 rounded-lg bg-card border border-border overflow-hidden">
          {/* SPLIT BODY: Settings left, Mapping right */}
          <div className="flex flex-1 overflow-hidden">
                  {/* LEFT PANEL — Settings */}
                  <div className="w-[480px] shrink-0 overflow-y-auto border-r border-border px-6 py-6">
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
                            <Combobox value={sourceAccountId} onValueChange={setSourceAccountId} options={accountOptions.filter((a) => a.value !== targetAccountId)} placeholder="Select source..." searchPlaceholder="Search accounts..." disabled={isEditing} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="target-account">Target account</Label>
                            <Combobox value={targetAccountId} onValueChange={setTargetAccountId} options={accountOptions.filter((a) => a.value !== sourceAccountId)} placeholder="Select target..." searchPlaceholder="Search accounts..." disabled={isEditing} />
                          </div>
                          {sourceAccountId && targetAccountId && sourceAccountId === targetAccountId && (<p className="text-xs text-destructive m-0">Source and target must be different accounts.</p>)}
                          {isDuplicateCombo && (<p className="text-xs text-destructive m-0">A sync rule with this source/target combination already exists.</p>)}
                          {isBidirectional && !isDuplicateCombo && (<p className="text-xs text-amber-600 m-0">A reverse sync already exists for these accounts.</p>)}
                        </>
                      )}
                    </div>

                    {/* Transactional lists */}
                    {isTransaction && (
                      <>
                        <div className="mt-6"><SectionDivider label="Lists" className="mb-0" /></div>
                        <div className="mt-3 flex flex-col gap-3">
                          <div className="space-y-1.5"><Label>Source list</Label><Combobox value={sourceListName} onValueChange={setSourceListName} options={sourceListOptions} placeholder="Select..." disabled={isEditing} /></div>
                          <div className="space-y-1.5"><Label>Target list</Label><Combobox value={targetListName} onValueChange={setTargetListName} options={targetListOptions} placeholder="Select..." disabled={isEditing} /></div>
                        </div>
                      </>
                    )}

                    {/* Match Key */}
                    <div className="mt-6"><SectionDivider label="Match Key" className="mb-0" /></div>
                    <p className="text-xs text-muted-foreground m-0 text-center mt-3">{isTransaction ? 'Identifies the same transaction in both lists.' : 'Identifies the same contact in both accounts. Must be unique in the target.'}</p>
                    <div className="mt-3 flex flex-col gap-3">
                      <div className="space-y-1.5"><Label>Source column</Label><Combobox value={matchColumnSource} onValueChange={setMatchColumnSource} options={sourceColumnOptions} placeholder="Select..." disabled={sourceColumns.length === 0 || isEditing} /></div>
                      <div className="space-y-1.5"><Label>Target Column</Label><Combobox value={matchColumnTarget} onValueChange={setMatchColumnTarget} options={targetColumnOptionsForMatch} placeholder="Select..." disabled={targetColumns.length === 0 || isEditing} /></div>
                    </div>

                    {/* Behaviour */}
                    <div className="mt-6"><SectionDivider label="Behaviour" className="mb-0" /></div>
                    <div className="mt-3 flex flex-col gap-3">
                      <div>
                        <Label className="text-sm font-semibold">When target record not found</Label>
                        <p className="text-xs text-muted-foreground m-0 mt-0.5">Choose what happens when no matching record exists.</p>
                        <SegmentedToggle className="mt-2" value={onMissing} onValueChange={(val) => setOnMissing(val as OnMissingBehaviour)} options={[{ value: 'create', label: 'Create new' }, { value: 'skip', label: 'Skip missing' }]} disabled={isEditing} />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Trigger scope</Label>
                        <p className="text-xs text-muted-foreground m-0 mt-0.5">A mapped column is any column you've linked to a field.</p>
                        <SegmentedToggle className="mt-2" value={triggerOnMappedOnly ? 'mapped' : 'any'} onValueChange={(val) => setTriggerOnMappedOnly(val === 'mapped')} options={[{ value: 'any', label: 'Any column' }, { value: 'mapped', label: 'Mapped only' }]} disabled={isEditing} />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT PANEL — Column Mapping */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {schemasReady ? (
                      <>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
                          <div className="flex items-center gap-2">
                            <ArrowsLeftRight size={16} weight="duotone" className="text-primary" />
                            <h3 className="text-sm font-semibold text-foreground m-0">Column Mapping</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {unmappedRequiredColumns.size > 0 && (<span className="flex items-center gap-1 text-xs text-amber-600"><Asterisk size={14} weight="bold" />{unmappedRequiredColumns.size} required unmapped</span>)}
                            {hasDuplicateTargets && (<span className="flex items-center gap-1 text-xs text-destructive"><WarningCircle size={14} weight="fill" />Duplicate targets</span>)}
                            <Badge variant={mappedCount > 0 ? 'default-subtle' : 'neutral-subtle'} className="text-[10px]">{mappedCount} mapped</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_40px_1fr_40px_1fr_40px] items-center px-6 py-3 bg-secondary border-b border-border">
                          <span className="text-sm font-semibold text-muted-foreground">Source Column</span><span />
                          <span className="text-sm font-semibold text-muted-foreground">Target Column</span><span />
                          <span className="text-sm font-semibold text-muted-foreground">Example Values</span><span />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {sortedMappingRows.map((row, displayIndex) => {
                            const actualIndex = mappingRows.findIndex((r) => r.sourceColumn === row.sourceColumn && r.targetColumn === row.targetColumn);
                            const isDuplicate = row.targetColumn !== '' && mappingRows.filter((r) => r.targetColumn === row.targetColumn).length > 1;
                            const exampleValue = targetExamples[row.targetColumn] ?? '';
                            const isMatchKeyRow = row.targetColumn !== '' && row.targetColumn === matchColumnTarget;
                            return (
                              <div key={`${row.targetColumn}-${displayIndex}`} className={cn('grid grid-cols-[1fr_40px_1fr_40px_1fr_40px] items-center px-6 py-2 border-b border-border/50', isMatchKeyRow && 'bg-primary/5 border-b-border')}>
                                <div className="flex items-center gap-2 h-9">
                                  {isMatchKeyRow ? (<span className="text-sm font-semibold text-primary truncate flex items-center gap-1.5"><Key size={14} weight="fill" className="shrink-0" />{row.sourceColumn}</span>)
                                    : (<Combobox value={row.sourceColumn} onValueChange={(val) => handleMappingSourceChange(actualIndex, val)} options={[{ value: '', label: '— Select source —' }, ...sourceColumns.map((c) => ({ value: c, label: c }))]} placeholder="— Select source —" />)}
                                </div>
                                <span className={cn('text-sm text-center select-none', isDuplicate ? 'text-destructive' : row.sourceColumn ? 'text-primary' : 'text-tertiary-foreground')} aria-hidden="true">→</span>
                                <div className="flex items-center gap-2 h-9">
                                  {row.isRequired ? (<span className={cn('text-sm font-normal text-foreground truncate flex items-center gap-1.5', isMatchKeyRow && 'font-semibold text-primary')}>{row.targetColumn}{targetRequiredWithoutDefaults.has(row.targetColumn) && <Asterisk size={12} weight="bold" className="shrink-0 text-amber-600" />}</span>)
                                    : (<Combobox value={row.targetColumn} onValueChange={(val) => handleMappingTargetChange(actualIndex, val)} options={[{ value: '', label: '— Select target —' }, ...targetColumns.filter((c) => !targetRequiredWithoutDefaults.has(c)).map((c) => ({ value: c, label: c }))]} placeholder="— Select target —" status={isDuplicate ? 'error' : 'normal'} />)}
                                </div>
                                <span className={cn('text-sm text-center select-none', isMatchKeyRow ? 'text-primary' : 'text-tertiary-foreground')} aria-hidden="true">{row.sourceColumn && row.targetColumn ? '=' : ''}</span>
                                <div className="flex items-center gap-1.5 min-w-0">{isDuplicate ? (<><WarningCircle size={16} weight="regular" className="shrink-0 text-destructive" /><span className="text-xs text-destructive">Duplicate</span></>) : (<span className={cn('text-sm truncate', isMatchKeyRow ? 'text-primary' : 'text-tertiary-foreground')} title={exampleValue}>{exampleValue || '—'}</span>)}</div>
                                <div className="flex items-center justify-center">{!row.isRequired && (<button type="button" onClick={() => handleRemoveMappingRow(actualIndex)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-destructive/10" title="Remove mapping"><Trash size={16} weight="regular" /></button>)}</div>
                              </div>
                            );
                          })}
                          <div className="px-6 py-3 border-b border-border/50"><button type="button" onClick={handleAddMappingRow} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"><Plus size={16} weight="bold" />Add mapping</button></div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center px-8">
                        <div className="text-center">
                          <ArrowsLeftRight size={32} className="text-border mx-auto mb-3" />
                          <p className="text-sm font-medium text-muted-foreground m-0">{!effectiveSourceId || !effectiveTargetId ? 'Select source and target accounts' : isTransaction && (!sourceListName || !targetListName) ? 'Select source and target lists' : 'No columns available for the selected accounts'}</p>
                          <p className="text-2xs text-tertiary-foreground mt-1 m-0">Column mapping will appear here once both sides are configured.</p>
                        </div>
                      </div>
                    )}
                  </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border px-6 py-4 flex items-center justify-end gap-3">
            <Button variant="secondaryGhost" onClick={handleCloseClick}>Cancel</Button>
            <Button onClick={handleSave} disabled={!isValid}>{isEditing ? 'Save Changes' : (isTransaction ? 'Create Transaction Sync' : 'Create Contact Sync')}</Button>
          </div>
        </div>
      </div>

      <AlertDialogComposed open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm} intent="destructive" title="Discard changes?" confirmLabel="Discard" cancelLabel="Keep editing" onConfirm={handleClose}>
        Your unsaved changes will be lost. This cannot be undone.
      </AlertDialogComposed>
    </div>
  );
}
