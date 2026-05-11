import { X } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-xl w-[560px] max-w-[90vw] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground m-0">{connector.name}</h2>
            <p className="text-[13px] text-muted-foreground mt-1 mb-0">{connection.name} · {connector.direction === 'import' ? 'Importer' : 'Exporter'}</p>
          </div>
          <button type="button" className="inline-flex items-center justify-center w-8 h-8 border-none bg-transparent rounded text-tertiary-foreground cursor-pointer transition-colors duration-150 shrink-0 hover:bg-secondary hover:text-foreground" onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* File Settings */}
          <div className="bg-background border border-border rounded-md px-4 py-3">
            <div className="mb-2 pb-1.5 border-b border-border">
              <h4 className="text-[13px] font-semibold text-foreground m-0">File Settings</h4>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Connection</span>
              <span className="text-[13px] text-foreground font-medium">{connection.name}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Protocol</span>
              <span className="text-[13px] text-foreground font-medium">{connection.protocol}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Base Path</span>
              <span className="text-[13px] text-foreground font-medium">{connection.basePath}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">File Type</span>
              <span className="text-[13px] text-foreground font-medium">{connector.fileType.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">File Pattern</span>
              <span className="text-[13px] text-foreground font-medium">{connector.fileNamingPattern}</span>
            </div>
          </div>

          {/* Data Configuration */}
          <div className="bg-background border border-border rounded-md px-4 py-3">
            <div className="mb-2 pb-1.5 border-b border-border">
              <h4 className="text-[13px] font-semibold text-foreground m-0">Data Configuration</h4>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Data Type</span>
              <span className="text-[13px] text-foreground font-medium">{DATA_TYPE_LABELS[connector.dataType] ?? connector.dataType}</span>
            </div>
            {connector.transactionalSource && (
              <div className="flex justify-between py-[3px]">
                <span className="text-[13px] text-tertiary-foreground">Source Table</span>
                <span className="text-[13px] text-foreground font-medium">{connector.transactionalSource}</span>
              </div>
            )}
            {connector.enrichmentKeyField && (
              <div className="flex justify-between py-[3px]">
                <span className="text-[13px] text-tertiary-foreground">Enrichment Key</span>
                <span className="text-[13px] text-foreground font-medium">{connector.enrichmentKeyField}</span>
              </div>
            )}
          </div>

          {/* Format Options */}
          <div className="bg-background border border-border rounded-md px-4 py-3">
            <div className="mb-2 pb-1.5 border-b border-border">
              <h4 className="text-[13px] font-semibold text-foreground m-0">Format Options</h4>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Delimiter</span>
              <span className="text-[13px] text-foreground font-medium">{connector.formatOptions.delimiter === ',' ? 'Comma (,)' : connector.formatOptions.delimiter === '|' ? 'Pipe (|)' : connector.formatOptions.delimiter === '\t' ? 'Tab' : connector.formatOptions.delimiter}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Header Row</span>
              <span className="text-[13px] text-foreground font-medium">{connector.formatOptions.includeHeader ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Date Format</span>
              <span className="text-[13px] text-foreground font-medium">{connector.formatOptions.dateFormat}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Timezone</span>
              <span className="text-[13px] text-foreground font-medium">{connector.formatOptions.timezone}</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-background border border-border rounded-md px-4 py-3">
            <div className="mb-2 pb-1.5 border-b border-border">
              <h4 className="text-[13px] font-semibold text-foreground m-0">Schedule</h4>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Frequency</span>
              <span className="text-[13px] text-foreground font-medium">{SCHEDULE_LABELS[connector.schedule] ?? connector.schedule}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Status</span>
              <span className={cn(
                "text-[13px] font-medium",
                connector.status === 'active' ? "text-primary" : "text-tertiary-foreground"
              )}>
                {connector.status === 'active' ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-background border border-border rounded-md px-4 py-3">
            <div className="mb-2 pb-1.5 border-b border-border">
              <h4 className="text-[13px] font-semibold text-foreground m-0">Metadata</h4>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Created</span>
              <span className="text-[13px] text-foreground font-medium">{formatDateTime(connector.createdAt)}</span>
            </div>
            <div className="flex justify-between py-[3px]">
              <span className="text-[13px] text-tertiary-foreground">Last Updated</span>
              <span className="text-[13px] text-foreground font-medium">{formatDateTime(connector.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-3 pb-4 border-t border-border">
          <button type="button" className="px-4 py-2 text-sm font-sans font-medium text-muted-foreground bg-background border border-border rounded cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" onClick={onClose}>Close</button>
          <button type="button" className="px-4 py-2 text-sm font-sans font-semibold text-primary-foreground bg-primary border-none rounded cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" onClick={() => { onClose(); onEdit(); }}>Edit Automation</button>
        </div>
      </div>
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
