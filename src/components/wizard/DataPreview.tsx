import { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import type { WizardDraft } from '../../models/wizard';

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
      <div className="mt-2" data-testid="data-preview">
        <span className="block text-sm font-semibold text-foreground mb-2">Preview</span>
        <div className="border border-border rounded-md py-6 px-4 flex items-center justify-center bg-secondary">
          <span className="text-sm text-tertiary-foreground">Select fields</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2" data-testid="data-preview">
      <span className="block text-sm font-semibold text-foreground mb-2">Preview</span>
      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {draft.selectedFields.map((f) => (
                <th key={f.key} className="text-left py-2 px-3 bg-secondary font-semibold text-muted-foreground border-b border-border whitespace-nowrap">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {draft.selectedFields.map((f) => (
                  <td key={f.key} className="py-2 px-3 text-foreground border-b border-border whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis last:border-b-0">{row[f.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
