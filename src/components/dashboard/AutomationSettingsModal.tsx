import React from 'react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { ModalHeader } from '../composed/modal-header';
import { ModalFooter } from '../composed/modal-footer';
import type { Automation, ScheduleFrequency } from '../../models/automation';
import type { Connection } from '../../models/connection';
import type { UpdateType, BlankValueHandling } from '../../models/importer';

interface AutomationSettingsModalProps {
  connector: Automation;
  connection: Connection;
  onClose: () => void;
  onEdit: () => void;
}

const SCHEDULE_LABELS: Record<ScheduleFrequency, string> = {
  every_15_min: 'Every 15 Minutes',
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

const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  'append-update': 'Append / Update',
  'append': 'Append Only',
  'update': 'Update Only',
};

const BLANK_VALUE_LABELS: Record<BlankValueHandling, string> = {
  'preserve': 'Preserve Existing Data',
  'import': 'Import Blank Values',
};

const PATH_MODE_LABELS: Record<string, string> = {
  automatic: 'Automatic',
  base: 'Base Path',
  custom: 'Custom Path',
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
              {connector.importerConfig ? (
                <>
                  {/* Importer: File Settings */}
                  <Section title="File Settings">
                    <Row label="Path Mode" value={PATH_MODE_LABELS[connector.importerConfig.filePathConfig.pathMode] ?? connector.importerConfig.filePathConfig.pathMode} />
                    <Row label="Folder Name" value={connector.importerConfig.filePathConfig.folderName || toKebabCase(connector.name)} />
                    {connector.importerConfig.filePathConfig.readPath && (
                      <Row label="Read Path" value={connector.importerConfig.filePathConfig.readPath} />
                    )}
                    {connector.importerConfig.filePathConfig.errorFolderPath && (
                      <Row label="Error Folder" value={connector.importerConfig.filePathConfig.errorFolderPath} />
                    )}
                    {connector.importerConfig.filePathConfig.archiveFolderPath && (
                      <Row label="Archive Folder" value={connector.importerConfig.filePathConfig.archiveFolderPath} />
                    )}
                    {connector.importerConfig.filePathConfig.fileNamePattern && (
                      <Row label="File Pattern" value={connector.importerConfig.filePathConfig.fileNamePattern} />
                    )}
                    <Row label="Importing To" value={DATA_TYPE_LABELS[connector.importerConfig.dataType ?? ''] ?? connector.importerConfig.dataType ?? 'Not set'} />
                  </Section>

                  {/* Importer: Contact Configuration */}
                  <Section title="Contact Configuration">
                    <Row label="Update Type" value={UPDATE_TYPE_LABELS[connector.importerConfig.contactConfig.updateType]} />
                    <Row label="Blank Values" value={BLANK_VALUE_LABELS[connector.importerConfig.contactConfig.blankValueHandling]} />
                    <Row label="Matching Fields" value={connector.importerConfig.contactConfig.matchingFields.join(', ') || 'None'} />
                  </Section>

                  {/* Importer: Transactional Configuration (if applicable) */}
                  {connector.importerConfig.transactionalMapping.length > 0 && (
                    <Section title="Transactional Configuration">
                      <Row label="Update Type" value={UPDATE_TYPE_LABELS[connector.importerConfig.transactionalConfig.updateType]} />
                      <Row label="Blank Values" value={BLANK_VALUE_LABELS[connector.importerConfig.transactionalConfig.blankValueHandling]} />
                      <Row label="Matching Fields" value={connector.importerConfig.transactionalConfig.matchingFields.join(', ') || 'None'} />
                    </Section>
                  )}

                  {/* Importer: Contact Mapping */}
                  {connector.importerConfig.contactMapping.length > 0 && (
                    <Section title="Contact Mapping">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-0.5">
                        {connector.importerConfig.contactMapping.map((mapping) => (
                          <React.Fragment key={`${mapping.sourceField}-${mapping.targetField}`}>
                            <span className="text-sm text-muted-foreground text-right">{mapping.sourceField}</span>
                            <span className="text-sm text-muted-foreground text-center">→</span>
                            <span className="text-sm text-primary font-medium">{mapping.targetField}</span>
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="mt-2 mb-0 text-xs text-muted-foreground">{connector.importerConfig.contactMapping.length} field{connector.importerConfig.contactMapping.length !== 1 ? 's' : ''} mapped</p>
                    </Section>
                  )}

                  {/* Importer: Transactional Mapping */}
                  {connector.importerConfig.transactionalMapping.length > 0 && (
                    <Section title="Transactional Mapping">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-0.5">
                        {connector.importerConfig.transactionalMapping.map((mapping) => (
                          <React.Fragment key={`${mapping.sourceField}-${mapping.targetField}`}>
                            <span className="text-sm text-muted-foreground text-right">{mapping.sourceField}</span>
                            <span className="text-sm text-muted-foreground text-center">→</span>
                            <span className="text-sm text-primary font-medium">{mapping.targetField}</span>
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="mt-2 mb-0 text-xs text-muted-foreground">{connector.importerConfig.transactionalMapping.length} field{connector.importerConfig.transactionalMapping.length !== 1 ? 's' : ''} mapped</p>
                    </Section>
                  )}

                  {/* Importer: Notifications */}
                  <Section title="Notifications">
                    <Row label="Failure" value={connector.importerConfig.notifications.failureEmails.length > 0 ? connector.importerConfig.notifications.failureEmails.join(', ') : 'Not configured'} />
                    <Row label="Success" value={connector.importerConfig.notifications.successEnabled ? (connector.importerConfig.notifications.successEmails.join(', ') || 'Enabled') : 'Disabled'} />
                    <Row label="No File Alert" value={connector.importerConfig.notifications.noFileAlertEnabled ? (connector.importerConfig.notifications.noFileAlertEmails.join(', ') || 'Enabled') : 'Disabled'} />
                  </Section>
                </>
              ) : (
                <Section title="Importer Configuration">
                  <p className="text-sm text-muted-foreground italic m-0">Not configured</p>
                </Section>
              )}
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
                <Row label="Email Address" value={connector.notifications?.emails?.join(', ') || '—'} />
                <Row label="Successful Export" value={connector.notifications?.successEnabled ? 'Enabled' : 'Disabled'} />
                <Row label="Failed Export" value={connector.notifications?.failureEnabled ? 'Enabled' : 'Disabled'} />
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
