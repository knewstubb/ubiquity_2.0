import { useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, ArrowsClockwise } from '@phosphor-icons/react';
import { CloseButton } from '@/components/ui/close-button';
import type { Automation } from '../../models/automation';

interface ActivityLogModalProps {
  connector: Automation;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  status: 'success' | 'failed' | 'running' | 'skipped';
  user: string;
  action: string;
  date: string;
}

function generateSampleEntries(connector: Automation): LogEntry[] {
  const base = [
    {
      id: '1',
      status: 'success' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} completed — 1,247 records processed`,
      date: '27 Apr 2026 at 08:00',
    },
    {
      id: '2',
      status: 'success' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} completed — 1,245 records processed`,
      date: '26 Apr 2026 at 08:00',
    },
    {
      id: '3',
      status: 'failed' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} failed — connection timeout after 30s`,
      date: '25 Apr 2026 at 08:00',
    },
    {
      id: '4',
      status: 'success' as const,
      user: 'Brad K.',
      action: `Manual ${connector.direction} triggered — 1,243 records processed`,
      date: '24 Apr 2026 at 14:32',
    },
    {
      id: '5',
      status: 'skipped' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} skipped — no new files detected`,
      date: '24 Apr 2026 at 08:00',
    },
  ];
  return base;
}

const STATUS_CONFIG = {
  success: { icon: CheckCircle, color: '#14B88A', bg: 'rgba(20, 184, 138, 0.12)' },
  failed: { icon: XCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
  running: { icon: ArrowsClockwise, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  skipped: { icon: Clock, color: '#A1A1AA', bg: 'rgba(161, 161, 170, 0.12)' },
};

export function ActivityLogModal({ connector, onClose }: ActivityLogModalProps) {
  const entries = generateSampleEntries(connector);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="activity-log-title">
      <div className="bg-background rounded-lg shadow-xl w-[520px] max-w-[90vw] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 id="activity-log-title" className="text-lg font-semibold text-foreground m-0">Activity Log</h2>
            <p className="text-[13px] text-muted-foreground mt-1 mb-0">{connector.name}</p>
          </div>
          <CloseButton size="default" onClick={onClose} aria-label="Close" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
          {entries.map((entry) => {
            const cfg = STATUS_CONFIG[entry.status];
            const Icon = cfg.icon;
            return (
              <div key={entry.id} className="flex items-start gap-3 py-3 border-b border-secondary last:border-b-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: cfg.bg }}>
                  <Icon size={16} weight="bold" color={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 text-[13px] leading-relaxed">
                    <span className="font-semibold text-foreground">{entry.user}</span>
                    <span className="text-muted-foreground">{entry.action}</span>
                  </div>
                  <span className="text-xs text-tertiary-foreground mt-0.5 block">{entry.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end">
          <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded cursor-pointer transition-colors duration-150 hover:bg-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
