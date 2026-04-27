import { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import type { WizardDraft } from '../../models/wizard';
import styles from './DataPreview.module.css';

interface DataPreviewProps {
  draft: WizardDraft;
}

export function DataPreview({ draft }: DataPreviewProps) {
  const { contacts, treatments, products } = useData();

  const rows = useMemo(() => {
    if (draft.selectedFields.length === 0) return [];

    const sampleSize = 3;

    if (draft.dataType === 'contact') {
      return contacts.slice(0, sampleSize).map((c) =>
        Object.fromEntries(
          draft.selectedFields.map((f) => [f.key, String((c as Record<string, unknown>)[f.key] ?? '')])
        )
      );
    }

    const txRecords = draft.transactionalSource === 'treatments' ? treatments : products;

    if (draft.dataType === 'transactional') {
      return txRecords.slice(0, sampleSize).map((r) =>
        Object.fromEntries(
          draft.selectedFields.map((f) => [f.key, String((r as Record<string, unknown>)[f.key] ?? '')])
        )
      );
    }

    // transactional_with_contact — join via customerId
    const contactMap = new Map(contacts.map((c) => [c.id, c]));
    return txRecords.slice(0, sampleSize).map((r) => {
      const contact = contactMap.get((r as Record<string, unknown>).customerId as string);
      const merged = { ...r, ...contact };
      return Object.fromEntries(
        draft.selectedFields.map((f) => [f.key, String((merged as Record<string, unknown>)[f.key] ?? '')])
      );
    });
  }, [draft, contacts, treatments, products]);

  if (draft.selectedFields.length === 0) {
    return (
      <div className={styles.container} data-testid="data-preview">
        <span className={styles.label}>Preview</span>
        <div className={styles.emptyTable}>
          <span className={styles.emptyText}>Select fields</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="data-preview">
      <span className={styles.label}>Preview</span>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {draft.selectedFields.map((f) => (
                <th key={f.key} className={styles.th}>{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {draft.selectedFields.map((f) => (
                  <td key={f.key} className={styles.td}>{row[f.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
