import { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { DragHandle } from '../shared/DragHandle';
import { DataPreview } from './DataPreview';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FieldDefinition } from '../../data/fieldRegistry';
import type { WizardDraft } from '../../models/wizard';
import type { SelectedField } from '../../models/automation';

interface FieldMappingStepProps {
  draft: WizardDraft;
  onUpdate: (patch: Partial<WizardDraft>) => void;
}

export function FieldMappingStep({ draft, onUpdate }: FieldMappingStepProps) {
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

  const unselectedFields = useMemo(
    () => availableFields.filter((f) => !selectedKeySet.has(f.key)),
    [availableFields, selectedKeySet],
  );

  const allSelected = availableFields.length > 0 && unselectedFields.length === 0;

  const handleToggleField = useCallback(
    (field: FieldDefinition) => {
      if (selectedKeySet.has(field.key)) {
        onUpdate({ selectedFields: draft.selectedFields.filter((f) => f.key !== field.key) });
      } else {
        const newField: SelectedField = { key: field.key, label: field.label, source: field.source };
        onUpdate({ selectedFields: [...draft.selectedFields, newField] });
      }
    },
    [draft.selectedFields, selectedKeySet, onUpdate],
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onUpdate({ selectedFields: [] });
    } else {
      onUpdate({
        selectedFields: availableFields.map((f) => ({ key: f.key, label: f.label, source: f.source })),
      });
    }
  }, [allSelected, availableFields, onUpdate]);

  // Drag handlers — only for selected fields
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
    <div className="flex flex-col gap-8" data-testid="field-mapping-step">

      <div className="flex flex-col gap-2">
        <div className="border border-border rounded-md overflow-hidden" role="group" aria-label="Export fields">
          {/* Select all header */}
          <div className="flex items-center py-2 px-3 border-b border-border bg-secondary">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-fields"
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all-fields">Select All</Label>
            </div>
          </div>

          {/* Selected fields — draggable */}
          {draft.selectedFields.map((field, index) => (
            <div
              key={field.key}
              className={cn(
                "flex items-center gap-2 py-2 px-3 border-b border-border last:border-b-0 transition-colors duration-150 cursor-grab bg-accent border-l-[3px] border-l-primary pl-[calc(0.75rem-3px)]",
                "hover:bg-accent active:cursor-grabbing",
                dragIndex === index && "opacity-50 shadow-md scale-[1.02] z-[1] relative",
                dragOverIndex === index && "border-t-2 border-t-primary pt-[calc(0.5rem-2px)]"
              )}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <DragHandle />
              <span className="text-xs text-accent-foreground font-semibold min-w-5 text-center shrink-0">{index + 1}</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`field-${field.key}`}
                  checked={true}
                  onCheckedChange={() => handleToggleField({ key: field.key, label: field.label, source: field.source })}
                />
                <Label htmlFor={`field-${field.key}`}>{field.label}</Label>
              </div>
              <span className="text-xs text-tertiary-foreground ml-auto py-1 px-2 bg-secondary rounded-full shrink-0">{field.source}</span>
            </div>
          ))}

          {/* Unselected fields — not draggable */}
          {unselectedFields.map((field) => (
            <div key={field.key} className="flex items-center gap-2 py-2 px-3 border-b border-border last:border-b-0 bg-background transition-colors duration-150 hover:bg-background">
              <div className="w-4 shrink-0" />
              <span className="min-w-5 shrink-0" />
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`field-${field.key}`}
                  checked={false}
                  onCheckedChange={() => handleToggleField(field)}
                />
                <Label htmlFor={`field-${field.key}`}>{field.label}</Label>
              </div>
              <span className="text-xs text-tertiary-foreground ml-auto py-1 px-2 bg-secondary rounded-full shrink-0">{field.source}</span>
            </div>
          ))}
        </div>

        {!hasFields && <span className="text-xs text-destructive">Select at least one field</span>}
      </div>

      <DataPreview draft={draft} />
    </div>
  );
}
