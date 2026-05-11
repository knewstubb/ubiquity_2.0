import { useState } from 'react';
import { DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import type { Connection } from '../../models/connection';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CardSelector } from '@/components/composed/card-selector';
import { ModalHeader } from '@/components/composed/modal-header';
import { ModalFooter } from '@/components/composed/modal-footer';

interface InitialModalProps {
  connection: Connection;
  onProceed: (name: string, direction: 'import' | 'export') => void;
  onClose: () => void;
}

export function InitialModal({ connection, onProceed, onClose }: InitialModalProps) {
  const [direction, setDirection] = useState<'import' | 'export' | null>(null);

  const canProceed = direction !== null;

  function handleProceed() {
    if (canProceed) onProceed('', direction!);
  }

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <DialogTitle className="sr-only">Select Automation Type</DialogTitle>
        <DialogDescription className="sr-only">Choose whether to import or export data</DialogDescription>
        <ModalHeader title="Select Automation Type" onClose={onClose} />

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <CardSelector
              icon={<DownloadSimple size={24} weight="regular" />}
              label="Importer"
              selected={direction === 'import'}
              onClick={() => setDirection('import')}
            />
            <CardSelector
              icon={<UploadSimple size={24} weight="regular" />}
              label="Exporter"
              selected={direction === 'export'}
              onClick={() => setDirection('export')}
            />
          </div>
        </div>

        <ModalFooter
          primaryAction={{ label: 'Next', onClick: handleProceed, disabled: !canProceed }}
          secondaryAction={{ label: 'Cancel', onClick: onClose, variant: 'ghost' }}
        />
      </DialogContent>
    </Dialog>
  );
}
