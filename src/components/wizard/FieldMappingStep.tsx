import { useState, useCallback, useMemo } from 'react';
import { Checkbox } from '../shared/Checkbox';
import { DragHandle } from '../shared/DragHandle';
import { DataPreview } from './DataPreview';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FieldDefinition } from '../../data/fieldRegistry';
import type { WizardDraft } from '../../models/wizard';
import type { SelectedField } from '../../models/connector';
import styles from './FieldMappingStep.module.css';

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
    <div className={styles.step} data-testid="field-mapping-step">
      <h3 className={styles.title}>Field Mapping</h3>
      <p className={styles.subtitle}>Select fields and drag to reorder. Selected fields appear at the top.</p>

      <div className={styles.section}>

        <div className={styles.fieldList} role="group" aria-label="Export fields">
          {/* Select all header */}
          <div className={styles.selectAllRow}>
            <Checkbox label="Select All" checked={allSelected} onChange={handleSelectAll} />
          </div>

          {/* Selected fields — draggable */}
          {draft.selectedFields.map((field, index) => {
            let itemClass = styles.fieldItem + ' ' + styles.fieldItemSelected;
            if (dragIndex === index) itemClass += ` ${styles.fieldItemDragging}`;
            if (dragOverIndex === index) itemClass += ` ${styles.fieldItemOver}`;
            return (
              <div
                key={field.key}
                className={itemClass}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <DragHandle />
                <span className={styles.orderNumber}>{index + 1}</span>
                <Checkbox
                  label={field.label}
                  checked={true}
                  onChange={() => handleToggleField({ key: field.key, label: field.label, source: field.source })}
                />
                <span className={styles.fieldSource}>{field.source}</span>
              </div>
            );
          })}

          {/* Unselected fields — not draggable */}
          {unselectedFields.map((field) => (
            <div key={field.key} className={styles.fieldItem}>
              <div className={styles.dragPlaceholder} />
              <span className={styles.orderPlaceholder} />
              <Checkbox
                label={field.label}
                checked={false}
                onChange={() => handleToggleField(field)}
              />
              <span className={styles.fieldSource}>{field.source}</span>
            </div>
          ))}
        </div>

        {!hasFields && <span className={styles.hintError}>Select at least one field</span>}
      </div>

      <DataPreview draft={draft} />
    </div>
  );
}
