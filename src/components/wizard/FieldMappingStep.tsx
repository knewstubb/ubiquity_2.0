import { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { DragHandle } from '../shared/DragHandle';
import { TruncatedText } from '../shared/TruncatedText';
import { SourceChipsRow } from './SourceChipsRow';
import { AddSourceModal } from './AddSourceModal';
import { Lock, ArrowCounterClockwise } from '@phosphor-icons/react';
import {
  getFieldsForSources,
  getEventFields,
  reorderFields,
  resolveColumnName,
  validateColumnName,
  validateColumnNames,
} from '../../utils/exporter-utils';
import { getFieldsForSourceConfig } from '../../utils/source-config-utils';
import { getSourceTag } from '../../models/source-selection';
import { usePrototypePhases } from '../../contexts/PrototypePhaseContext';
import type { ExporterWizardDraft, ColumnRename } from '../../models/wizard';
import type { SelectedField } from '../../models/automation';
import type { EnrichmentConfig } from '../../models/source-selection';

interface FieldMappingStepProps {
  draft: ExporterWizardDraft;
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void;
}

export function FieldMappingStep({ draft, onUpdate }: FieldMappingStepProps) {
  const { phases } = usePrototypePhases()
  const exporterPhase = phases.exporterPhase
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isEventBased = draft.exporterType === 'event_based';

  // Event fields — immutable, auto-included based on selected event sources
  const eventFields = useMemo<SelectedField[]>(() => {
    if (!isEventBased) return [];
    return getEventFields(draft.selectedEventSources);
  }, [isEventBased, draft.selectedEventSources]);

  // Contact/transactional available fields
  const availableContactFields = useMemo<SelectedField[]>(() => {
    // Use new sourceConfig-based field resolution when available
    if (draft.sourceConfig) {
      const sourceFields = getFieldsForSourceConfig(draft.sourceConfig);
      return sourceFields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source as SelectedField['source'],
      }));
    }
    // Legacy fallback for drafts without sourceConfig
    if (isEventBased) {
      // For event-based, optional contact fields come from 'contact' source
      return getFieldsForSources(['contact']);
    }
    return getFieldsForSources(draft.selectedSources ?? []);
  }, [isEventBased, draft.sourceConfig, draft.selectedSources]);

  // Set of event field keys for quick lookup
  const eventFieldKeySet = useMemo(
    () => new Set(eventFields.map((f) => f.key)),
    [eventFields],
  );

  // Selected contact/additional fields (non-event fields in selectedFields)
  const selectedContactFields = useMemo(
    () => draft.selectedFields.filter((f) => !eventFieldKeySet.has(f.key)),
    [draft.selectedFields, eventFieldKeySet],
  );

  const selectedContactKeySet = useMemo(
    () => new Set(selectedContactFields.map((f) => f.key)),
    [selectedContactFields],
  );

  // Unselected contact fields
  const unselectedContactFields = useMemo(
    () => availableContactFields.filter((f) => !selectedContactKeySet.has(f.key) && !eventFieldKeySet.has(f.key)),
    [availableContactFields, selectedContactKeySet, eventFieldKeySet],
  );

  // Combined ordered field list for display (event fields first, then contact fields)
  const allDisplayFields = useMemo<SelectedField[]>(() => {
    if (isEventBased) {
      return [...eventFields, ...selectedContactFields];
    }
    return draft.selectedFields;
  }, [isEventBased, eventFields, selectedContactFields, draft.selectedFields]);

  // Resolve all column names for duplicate detection
  const resolvedNames = useMemo(() => {
    return allDisplayFields.map((f) =>
      resolveColumnName(f.key, draft.columnRenames, f.label)
    );
  }, [allDisplayFields, draft.columnRenames]);

  const duplicateValidation = useMemo(
    () => validateColumnNames(resolvedNames),
    [resolvedNames],
  );

  // Per-field validation errors
  const fieldErrors = useMemo(() => {
    const errors = new Map<string, string>();
    for (const field of allDisplayFields) {
      const name = resolveColumnName(field.key, draft.columnRenames, field.label);
      const validation = validateColumnName(name);
      if (!validation.valid && validation.error) {
        errors.set(field.key, validation.error);
      } else if (!duplicateValidation.valid && duplicateValidation.duplicates.includes(name)) {
        errors.set(field.key, `Duplicate column name "${name}"`);
      }
    }
    return errors;
  }, [allDisplayFields, draft.columnRenames, duplicateValidation]);

  // Show join key indicator for contact/transactional with multiple sources
  const showJoinIndicator = !isEventBased && draft.selectedSources.length > 1;

  // Select all for contact fields
  const allContactSelected = availableContactFields.length > 0 && unselectedContactFields.length === 0;

  const handleToggleContactField = useCallback(
    (field: SelectedField) => {
      if (selectedContactKeySet.has(field.key)) {
        // Deselect
        const newFields = draft.selectedFields.filter((f) => f.key !== field.key);
        const newRenames = draft.columnRenames.filter((r) => r.fieldKey !== field.key);
        onUpdate({ selectedFields: newFields, columnRenames: newRenames });
      } else {
        // Select
        onUpdate({ selectedFields: [...draft.selectedFields, field] });
      }
    },
    [draft.selectedFields, draft.columnRenames, selectedContactKeySet, onUpdate],
  );

  const handleSelectAllContact = useCallback(() => {
    if (allContactSelected) {
      // Deselect all contact fields
      if (isEventBased) {
        onUpdate({ selectedFields: [], columnRenames: draft.columnRenames.filter((r) => eventFieldKeySet.has(r.fieldKey)) });
      } else {
        onUpdate({ selectedFields: [], columnRenames: [] });
      }
    } else {
      // Select all contact fields
      const allFields = isEventBased
        ? [...availableContactFields]
        : [...availableContactFields];
      onUpdate({ selectedFields: allFields });
    }
  }, [allContactSelected, isEventBased, availableContactFields, draft.columnRenames, eventFieldKeySet, onUpdate]);

  // Column rename handlers
  const handleRename = useCallback(
    (fieldKey: string, outputName: string) => {
      const existing = draft.columnRenames.filter((r) => r.fieldKey !== fieldKey);
      const newRenames: ColumnRename[] = [...existing, { fieldKey, outputName }];
      onUpdate({ columnRenames: newRenames });
    },
    [draft.columnRenames, onUpdate],
  );

  const handleResetRename = useCallback(
    (fieldKey: string) => {
      onUpdate({ columnRenames: draft.columnRenames.filter((r) => r.fieldKey !== fieldKey) });
    },
    [draft.columnRenames, onUpdate],
  );

  // Remove enrichment handler — removes the enrichment at the given index,
  // cleans up selectedFields and columnRenames for fields belonging to that source
  const handleRemoveEnrichment = useCallback(
    (index: number) => {
      if (!draft.sourceConfig) return;
      const enrichments = draft.sourceConfig.enrichments ?? [];
      if (index < 0 || index >= enrichments.length) return;

      const removed = enrichments[index];
      const sourceTag = getSourceTag(removed);

      // Remove the enrichment from the array
      const newEnrichments = [...enrichments.slice(0, index), ...enrichments.slice(index + 1)];

      // Filter out selected fields whose source matches the removed enrichment
      const newSelectedFields = draft.selectedFields.filter((f) => f.source !== sourceTag);

      // Filter out column renames for fields that were removed
      const remainingFieldKeys = new Set(newSelectedFields.map((f) => f.key));
      const newColumnRenames = draft.columnRenames.filter((r) => remainingFieldKeys.has(r.fieldKey));

      onUpdate({
        sourceConfig: { ...draft.sourceConfig, enrichments: newEnrichments },
        selectedFields: newSelectedFields,
        columnRenames: newColumnRenames,
      });
    },
    [draft.sourceConfig, draft.selectedFields, draft.columnRenames, onUpdate],
  );

  // Confirm add handler — appends new enrichments to the existing array
  const handleConfirmAdd = useCallback(
    (newEnrichments: EnrichmentConfig[]) => {
      if (!draft.sourceConfig) return;
      const existing = draft.sourceConfig.enrichments ?? [];
      onUpdate({
        sourceConfig: { ...draft.sourceConfig, enrichments: [...existing, ...newEnrichments] },
      });
    },
    [draft.sourceConfig, onUpdate],
  );

  // Drag handlers for reordering
  const handleDragStart = useCallback((index: number) => { setDragIndex(index); }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;
      setDragOverIndex(index);
    },
    [dragIndex],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === dropIndex) {
        setDragIndex(null);
        setDragOverIndex(null);
        return;
      }

      if (isEventBased) {
        // For event-based, reorder within the combined list (event + contact fields)
        const combined = [...eventFields, ...selectedContactFields];
        const reordered = reorderFields(combined, dragIndex, dropIndex);
        // Store only the contact fields in selectedFields (event fields are derived from sources)
        const newContactFields = reordered.filter((f) => !eventFieldKeySet.has(f.key));
        onUpdate({ selectedFields: newContactFields });
      } else {
        const reordered = reorderFields(draft.selectedFields, dragIndex, dropIndex);
        onUpdate({ selectedFields: reordered });
      }

      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, isEventBased, eventFields, selectedContactFields, eventFieldKeySet, draft.selectedFields, onUpdate],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const hasFields = isEventBased
    ? eventFields.length > 0
    : draft.selectedFields.length > 0;

  // Get the rename value for a field (empty string if no rename)
  const getRenameValue = (fieldKey: string): string => {
    const rename = draft.columnRenames.find((r) => r.fieldKey === fieldKey);
    return rename?.outputName ?? '';
  };

  const hasRename = (fieldKey: string): boolean => {
    return draft.columnRenames.some((r) => r.fieldKey === fieldKey);
  };

  return (
    <div className="flex flex-col gap-6" data-testid="field-mapping-step">

      {/* Join key indicator for contact/transactional with multiple sources */}
      {showJoinIndicator && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2" data-testid="join-key-indicator">
          <p className="text-xs text-muted-foreground m-0">
            Joined by: <span className="font-medium text-foreground">Email Address</span>
          </p>
        </div>
      )}

      {/* Source chips row — shows active sources with add/remove (Phase 2+) */}
      {draft.sourceConfig && exporterPhase >= 2 && (
        <>
          <SourceChipsRow
            primarySource={draft.sourceConfig.primarySource}
            enrichments={draft.sourceConfig.enrichments ?? []}
            onRemoveEnrichment={handleRemoveEnrichment}
            onOpenAddModal={() => setModalOpen(true)}
          />
          <AddSourceModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            activeEnrichments={draft.sourceConfig.enrichments ?? []}
            primarySource={draft.sourceConfig.primarySource}
            onConfirm={handleConfirmAdd}
          />
        </>
      )}

      {/* Event fields section (event-based only) */}
      {isEventBased && eventFields.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Lock size={14} weight="bold" className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Event Fields
            </span>
            <span className="text-xs text-tertiary-foreground">(auto-included, cannot be removed)</span>
          </div>
          <div className="border border-border rounded-md overflow-hidden" role="group" aria-label="Event fields">
            {eventFields.map((field, index) => {
              const resolvedName = resolveColumnName(field.key, draft.columnRenames, field.label);
              const error = fieldErrors.get(field.key);
              const renameValue = getRenameValue(field.key);
              const isRenamed = hasRename(field.key);

              return (
                <div
                  key={field.key}
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 border-b border-border last:border-b-0 transition-colors duration-150 cursor-grab bg-accent/50 border-l-[3px] border-l-muted-foreground pl-[calc(0.75rem-3px)]",
                    "hover:bg-accent/70 active:cursor-grabbing",
                    dragIndex === index && "opacity-50 shadow-md scale-[1.02] z-[1] relative",
                    dragOverIndex === index && "border-t-2 border-t-primary pt-[calc(0.5rem-2px)]"
                  )}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  data-testid={`event-field-${field.key}`}
                >
                  <DragHandle />
                  <span className="text-xs text-accent-foreground font-semibold min-w-5 text-center shrink-0">{index + 1}</span>
                  <Lock size={12} weight="bold" className="text-muted-foreground shrink-0" />
                  <TruncatedText className="text-sm text-foreground font-medium max-w-[160px]">{field.label}</TruncatedText>
                  <span className="text-xs text-muted-foreground font-medium py-0.5 px-2 bg-secondary border border-border/60 rounded-full shrink-0">{field.source}</span>

                  {/* Column rename input */}
                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    <Input
                      value={renameValue}
                      onChange={(e) => handleRename(field.key, e.target.value)}
                      placeholder={field.label}
                      className="h-7 w-40 text-xs"
                      maxLength={128}
                      aria-label={`Output column name for ${field.label}`}
                      aria-invalid={!!error}
                      data-testid={`rename-input-${field.key}`}
                    />
                    {isRenamed && (
                      <button
                        type="button"
                        onClick={() => handleResetRename(field.key)}
                        className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label={`Reset column name for ${field.label}`}
                        data-testid={`reset-rename-${field.key}`}
                      >
                        <ArrowCounterClockwise size={12} weight="bold" />
                      </button>
                    )}
                  </div>
                  {error && <span className="text-xs text-destructive ml-1" data-testid={`field-error-${field.key}`}>{error}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact/Additional fields section */}
      <div className="flex flex-col gap-2">
        {isEventBased && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Additional Contact Fields
            </span>
            <span className="text-xs text-tertiary-foreground">(optional)</span>
          </div>
        )}

        <div className="border border-border rounded-md overflow-hidden" role="group" aria-label={isEventBased ? "Additional contact fields" : "Export fields"}>
          {/* Select all header */}
          <div className="flex items-center py-2 px-3 border-b border-border bg-secondary">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-fields"
                checked={allContactSelected}
                onCheckedChange={handleSelectAllContact}
              />
              <Label htmlFor="select-all-fields">Select All</Label>
            </div>
          </div>

          {/* Selected contact fields — draggable with rename */}
          {(isEventBased ? selectedContactFields : draft.selectedFields).map((field, index) => {
            const displayIndex = isEventBased ? eventFields.length + index : index;
            const resolvedName = resolveColumnName(field.key, draft.columnRenames, field.label);
            const error = fieldErrors.get(field.key);
            const renameValue = getRenameValue(field.key);
            const isRenamed = hasRename(field.key);

            return (
              <div
                key={field.key}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 border-b border-border last:border-b-0 transition-colors duration-150 cursor-grab bg-accent/50 border-l-[3px] border-l-primary pl-[calc(0.75rem-3px)]",
                  "hover:bg-accent/70 active:cursor-grabbing",
                  dragIndex === (isEventBased ? eventFields.length + index : index) && "opacity-50 shadow-md scale-[1.02] z-[1] relative",
                  dragOverIndex === (isEventBased ? eventFields.length + index : index) && "border-t-2 border-t-primary pt-[calc(0.5rem-2px)]"
                )}
                draggable
                onDragStart={() => handleDragStart(isEventBased ? eventFields.length + index : index)}
                onDragOver={(e) => handleDragOver(e, isEventBased ? eventFields.length + index : index)}
                onDrop={(e) => handleDrop(e, isEventBased ? eventFields.length + index : index)}
                onDragEnd={handleDragEnd}
              >
                <DragHandle />
                <span className="text-xs text-accent-foreground font-semibold min-w-5 text-center shrink-0">{displayIndex + 1}</span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`field-${field.key}`}
                    checked={true}
                    onCheckedChange={() => handleToggleContactField(field)}
                  />
                  <TruncatedText className="text-sm font-medium max-w-[160px]">{field.label}</TruncatedText>
                </div>
                <span className="text-xs text-muted-foreground font-medium py-0.5 px-2 bg-secondary border border-border/60 rounded-full shrink-0">{field.source}</span>

                {/* Column rename input */}
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  <Input
                    value={renameValue}
                    onChange={(e) => handleRename(field.key, e.target.value)}
                    placeholder={field.label}
                    className="h-7 w-40 text-xs"
                    maxLength={128}
                    aria-label={`Output column name for ${field.label}`}
                    aria-invalid={!!error}
                    data-testid={`rename-input-${field.key}`}
                  />
                  {isRenamed && (
                    <button
                      type="button"
                      onClick={() => handleResetRename(field.key)}
                      className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      aria-label={`Reset column name for ${field.label}`}
                      data-testid={`reset-rename-${field.key}`}
                    >
                      <ArrowCounterClockwise size={12} weight="bold" />
                    </button>
                  )}
                </div>
                {error && <span className="text-xs text-destructive ml-1" data-testid={`field-error-${field.key}`}>{error}</span>}
              </div>
            );
          })}

          {/* Unselected fields — not draggable */}
          {unselectedContactFields.map((field) => (
            <div key={field.key} className="flex items-center gap-2 py-2 px-3 border-b border-border last:border-b-0 bg-card transition-colors duration-150 hover:bg-card min-h-[44px]">
              <span className="w-[22px] shrink-0" />
              <span className="min-w-5 shrink-0" />
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`field-${field.key}`}
                  checked={false}
                  onCheckedChange={() => handleToggleContactField(field)}
                />
                <TruncatedText className="text-sm font-medium max-w-[160px]">{field.label}</TruncatedText>
              </div>
              <span className="text-xs text-muted-foreground font-medium py-0.5 px-2 bg-secondary border border-border/60 rounded-full shrink-0">{field.source}</span>
            </div>
          ))}
        </div>

        {!hasFields && !isEventBased && (
          <span className="text-xs text-destructive" data-testid="no-fields-error">Select at least one field</span>
        )}
      </div>
    </div>
  );
}
