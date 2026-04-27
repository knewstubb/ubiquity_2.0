import { useState, useCallback, useMemo } from 'react';
import { Checkbox } from '../shared/Checkbox';
import { DragHandle } from '../shared/DragHandle';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FieldDefinition } from '../../data/fieldRegistry';
import type { WizardDraft } from '../../models/wizard';
import type { SelectedField } from '../../models/connector';
import styles from './FieldSelectionStep.module.css';

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
    <div className={styles.step} data-testid="field-selection-step">
      {/* Available fields with checkboxes */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Available Fields</span>
        <span className={styles.hint}>Select the fields to include in your export</span>
        <div className={styles.fieldList} role="group" aria-label="Available fields">
          <div className={styles.selectAllRow}>
            <Checkbox
              label="Select All"
              checked={allSelected}
              onChange={handleSelectAll}
              data-testid="select-all-checkbox"
            />
          </div>
          {availableFields.map((field) => (
            <div key={field.key} className={styles.fieldItem}>
              <Checkbox
                label={field.label}
                checked={selectedKeySet.has(field.key)}
                onChange={() => handleToggleField(field)}
                data-testid={`field-checkbox-${field.key}`}
              />
              <span className={styles.fieldSource}>{field.source}</span>
            </div>
          ))}
        </div>
        {!hasFields && (
          <span className={styles.hintError}>Select at least one field</span>
        )}
      </div>

      {/* Selected fields with drag-to-reorder */}
      {hasFields && (
        <div className={styles.reorderSection}>
          <span className={styles.sectionLabel}>Column Order</span>
          <span className={styles.hint}>Drag to reorder the export columns</span>
          <ul className={styles.reorderList} data-testid="reorder-list">
            {draft.selectedFields.map((field, index) => {
              let itemClass = styles.reorderItem;
              if (dragIndex === index) itemClass += ` ${styles.reorderItemDragging}`;
              if (dragOverIndex === index) itemClass += ` ${styles.reorderItemOver}`;

              return (
                <li
                  key={field.key}
                  className={itemClass}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  data-testid={`reorder-item-${field.key}`}
                >
                  <DragHandle />
                  <span className={styles.orderNumber}>{index + 1}</span>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <span className={styles.fieldSource}>{field.source}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
