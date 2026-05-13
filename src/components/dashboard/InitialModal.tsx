import { useState } from 'react';
import { DownloadSimple, UploadSimple, ArrowsLeftRight } from '@phosphor-icons/react';
import type { Connection } from '../../models/connection';
import { ChooserModal, type ChooserOption } from '@/components/composed/chooser-modal';

interface InitialModalProps {
  connection: Connection;
  onProceed: (name: string, direction: 'import' | 'export') => void;
  onClose: () => void;
}

const DIRECTION_OPTIONS: ChooserOption[] = [
  { id: 'import', icon: <DownloadSimple size={28} weight="light" />, label: 'Importer' },
  { id: 'export', icon: <UploadSimple size={28} weight="light" />, label: 'Exporter' },
];

export function InitialModal({ connection, onProceed, onClose }: InitialModalProps) {
  const [direction, setDirection] = useState<string | null>(null);

  function handleConfirm() {
    if (direction) onProceed('', direction as 'import' | 'export');
  }

  return (
    <ChooserModal
      open={true}
      onOpenChange={(open) => { if (!open) onClose(); }}
      icon={<ArrowsLeftRight size={48} weight="light" />}
      title="Select Automation Type"
      description={`Choose the direction for your automation on ${connection.name}.`}
      options={DIRECTION_OPTIONS}
      selectedId={direction}
      onSelect={setDirection}
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmDisabled={!direction}
    />
  );
}
