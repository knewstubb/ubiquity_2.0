import { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Checkbox } from '../shared/Checkbox';
import { DragHandle } from '../shared/DragHandle';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FieldDefinition } from '../../data/fieldRegistry';
import type { WizardDraft } from '../../models/wizard';
import type { SelectedField } from '../../models/automation';

interface FieldSelectionStepProps {
  draft: WizardDraft;
  onUpdate: (patch: Partial<WizardDraft>) => void;
}

export function FieldSelectionStep({ draft, onUpdate }: FieldSelectionStepProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const availableFields = useMemo<FieldDefinition[]>(() => {
    if (!draft.dataType) return [];
    return getFieldsForDataType(draft.dataType, draft.transactionalSource ?? undefined);
  }, [draft.dataType, draft.transactionalSource]);

  const selectedKeySet = useMemo(
    () => new Set(draft.selectedFields.map((f) => f.key)),
    [draft.selectedFields],
  );

  const allSelected = availableFields.length > 0 && availableFields.every((f) => selectedKeySet.has(f.key));

  const handleToggleField = useCallback(
    (field: FieldDefinition) => {
      if (selectedKeySet.has(field.key)) {
        onUpdate({
          selectedFields: draft.selectedFields.filter((f) => f.key !== field.key),
        });
      } else {
        const newField: SelectedField = {
          key: field.key,
          label: field.label,
          source: field.source,
        };
        onUpdate({
          selectedFields: [...draft.selectedFields, newField],
        });
      }
    },
    [draft.selectedFields, selectedKeySet, onUpdate],
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onUpdate({ selectedFields: [] });
    } else {
      const allFields: SelectedField[] = availableFields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source,
      }));
      onUpdate({ selectedFields: allFields });
    }
  }, [allSelected, availableFields, onUpdate]);

  // Drag-and-drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

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
      const reordered = [...draft.selectedFields];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(dropIndex, 0, moved);
      onUpdate({ selectedFields: reordered });
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, draft.selectedFields, onUpdate],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const hasFields = draft.selectedFields.length > 0;

  return (
    <div className="flex flex-col gap-6" data-testid="field-selection-step">
      {/* Available fields with checkboxes */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Available Fields</span>
        <span className="text-xs text-tertiary-foreground">Select the fields to include in your export</span>
        <div className="border border-border rounded-md overflow-hidden" role="group" aria-label="Available fields">
          <div className="flex items-center py-2 px-3 border-b border-border bg-secondary rounded-t-md">
            <Checkbox
              label="Select All"
              checked={allSelected}
              onChange={handleSelectAll}
              data-testid="select-all-checkbox"
            />
          </div>
          {availableFields.map((field) => (
            <div key={field.key} className="flex items-center gap-2 py-2 px-3 border-b border-border last:border-b-0 bg-background transition-colors duration-150 hover:bg-background">
              <Checkbox
                label={field.label}
                checked={selectedKeySet.has(field.key)}
                onChange={() => handleToggleField(field)}
                data-testid={`field-checkbox-${field.key}`}
              />
              <span className="text-xs text-tertiary-foreground ml-auto py-1 px-2 bg-secondary rounded-full">{field.source}</span>
            </div>
          ))}
        </div>
        {!hasFields && (
          <span className="text-xs text-destructive">Select at least one field</span>
        )}
      </div>

      {/* Selected fields with drag-to-reorder */}
      {hasFields && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Column Order</span>
          <span className="text-xs text-tertiary-foreground">Drag to reorder the export columns</span>
          <ul className="list-none m-0 p-0 border border-border rounded-md overflow-hidden" data-testid="reorder-list">
            {draft.selectedFields.map((field, index) => (
              <li
                key={field.key}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 border-b border-border last:border-b-0 bg-background cursor-grab transition-all duration-150 hover:bg-background active:cursor-grabbing active:bg-accent",
                  dragIndex === index && "opacity-50 bg-accent shadow-md scale-[1.02] z-[1] relative",
                  dragOverIndex === index && "border-t-2 border-t-primary pt-[calc(0.5rem-2px)]"
                )}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                data-testid={`reorder-item-${field.key}`}
              >
                <DragHandle />
                <span className="text-xs text-tertiary-foreground min-w-5 text-center">{index + 1}</span>
                <span className="text-sm text-foreground flex-1">{field.label}</span>
                <span className="text-xs text-tertiary-foreground ml-auto py-1 px-2 bg-secondary rounded-full">{field.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
