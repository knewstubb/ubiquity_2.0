import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { ModalHeader } from '../composed/modal-header';
import { ModalFooter } from '../composed/modal-footer';
import type { Automation } from '../../models/automation';
import type { Connection } from '../../models/connection';

interface AutomationSettingsModalProps {
  connector: Automation;
  connection: Connection;
  onClose: () => void;
  onEdit: () => void;
}

const SCHEDULE_LABELS: Record<string, string> = {
  every_15_min: 'Every 15 minutes',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DATA_TYPE_LABELS: Record<string, string> = {
  contact: 'Contacts',
  transactional: 'Transactional',
  transactional_with_contact: 'Transactional + Contact',
};

export function AutomationSettingsModal({ connector, connection, onClose, onEdit }: AutomationSettingsModalProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[560px] p-0 gap-0">
        <DialogTitle className="sr-only">{connector.name}</DialogTitle>
        <DialogDescription className="sr-only">Automation settings for {connector.name}</DialogDescription>
        <ModalHeader
          title={connector.name}
          description={`${connection.name} · ${connector.direction === 'import' ? 'Importer' : 'Exporter'}`}
          onClose={onClose}
        />

        <div className="px-6 py-5 overflow-y-auto max-h-[60vh] flex flex-col gap-5">
          {connector.direction === 'import' ? (
            <>
              {/* Importer: File Settings */}
              <Section title="File Settings">
                <Row label="Path Mode" value="Automatic" />
                <Row label="Folder Name" value={toKebabCase(connector.name)} />
                <Row label="Sample File" value="sample-contacts.csv" />
                <Row label="Importing To" value={DATA_TYPE_LABELS[connector.dataType] ?? connector.dataType} />
                <Row label="Database" value="Customer Contacts" />
              </Section>

              {/* Importer: Contact Configuration */}
              <Section title="Contact Configuration">
                <Row label="Update Type" value="Append / Update" />
                <Row label="Blank Values" value="Preserve Existing Data" />
                <Row label="Matching Fields" value="Email, Customer ID" />
              </Section>

              {/* Importer: Contact Mapping */}
              <Section title="Contact Mapping">
                <div className="flex flex-col gap-1">
                  {connector.selectedFields.length > 0 ? (
                    connector.selectedFields.slice(0, 5).map((field) => (
                      <div key={field.key} className="flex items-center gap-2 py-0.5">
                        <span className="text-sm text-muted-foreground min-w-[120px]">{field.key}</span>
                        <span className="text-sm text-muted-foreground">→</span>
                        <span className="text-sm text-primary font-medium">{field.label}</span>
                      </div>
                    ))
                  ) : (
                    <Row label="" value="No fields mapped" />
                  )}
                </div>
                {connector.selectedFields.length > 0 && (
                  <p className="mt-2 mb-0 text-xs text-muted-foreground">{connector.selectedFields.length} fields mapped</p>
                )}
              </Section>

              {/* Importer: Notifications */}
              <Section title="Notifications">
                <Row label="Failure" value="contact@gmail.com" />
                <Row label="Success" value="Disabled" />
                <Row label="No File Alert" value="Disabled" />
              </Section>
            </>
          ) : (
            <>
              {/* Exporter: Data Source */}
              <Section title="Data Source">
                <Row label="Connection" value={connection.name} />
                <Row label="Exporting From" value={DATA_TYPE_LABELS[connector.dataType] ?? connector.dataType} />
                {(connector.dataType === 'contact' || connector.dataType === 'transactional_with_contact') && (
                  <Row label="Contacts Database" value="Customer Contacts" />
                )}
                {connector.transactionalSource && (
                  <Row label="Source Table" value={connector.transactionalSource} />
                )}
                {connector.enrichmentKeyField && (
                  <Row label="Key Field" value={`${connector.enrichmentKeyField} → ContactRecord.id`} />
                )}
                <Row label="Filters" value="No filters applied" />
              </Section>

              {/* Exporter: Field Mapping */}
              <Section title="Field Mapping">
                {connector.selectedFields.length > 0 ? (
                  <>
                    {connector.selectedFields.map((field, index) => (
                      <Row key={field.key} label={`${index + 1}.`} value={field.label} />
                    ))}
                  </>
                ) : (
                  <Row label="" value="No fields selected" />
                )}
              </Section>

              {/* Exporter: File Configuration */}
              <Section title="File Configuration">
                <Row label="File Type" value={connector.fileType.toUpperCase()} />
                {connector.fileType === 'csv' && (
                  <Row label="Delimiter" value={connector.formatOptions.delimiter === ',' ? 'Comma (,)' : connector.formatOptions.delimiter === '|' ? 'Pipe (|)' : connector.formatOptions.delimiter === '\t' ? 'Tab' : connector.formatOptions.delimiter} />
                )}
                <Row label="Header Row" value={connector.formatOptions.includeHeader ? 'Enabled' : 'Disabled'} />
                <Row label="Date Format" value={connector.formatOptions.dateFormat} />
                <Row label="Timezone" value={connector.formatOptions.timezone} />
                <Row label="File Naming" value={connector.fileNamingPattern || '—'} />
                <Row label="Output Path" value={`/company/base-path/${toKebabCase(connector.name)}/`} />
              </Section>

              {/* Exporter: Schedule */}
              <Section title="Schedule">
                <Row label="Frequency" value={SCHEDULE_LABELS[connector.schedule] ?? connector.schedule} />
                <Row
                  label="Status"
                  value={connector.status === 'active' ? 'Active' : 'Paused'}
                  valueClassName={connector.status === 'active' ? 'text-primary' : 'text-muted-foreground'}
                />
              </Section>

              {/* Exporter: Notifications */}
              <Section title="Notifications">
                <Row label="Email Address" value="contact@gmail.com" />
                <Row label="Successful Export" value="Enabled" />
                <Row label="Failed Export" value="Enabled" />
              </Section>
            </>
          )}

          {/* Metadata (both) */}
          <Section title="Metadata">
            <Row label="Created" value={formatDateTime(connector.createdAt)} />
            <Row label="Last Updated" value={formatDateTime(connector.updatedAt)} />
          </Section>
        </div>

        <ModalFooter
          primaryAction={{ label: 'Edit Automation', onClick: () => { onClose(); onEdit(); } }}
          secondaryAction={{ label: 'Close', onClick: onClose }}
        />
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-primary pl-4">
      <h4 className="text-sm font-semibold text-foreground m-0 mb-2">{title}</h4>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm text-foreground font-medium', valueClassName)}>{value}</span>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} at ${hours}:${mins}`;
}
