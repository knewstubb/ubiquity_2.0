import { useEffect, useCallback } from 'react';
import { X, Plus, Play, Pause, PencilSimple } from '@phosphor-icons/react';
import type { Automation } from '../../models/automation';

interface HistoryModalProps {
  connector: Automation;
  onClose: () => void;
}

interface HistoryEntry {
  id: string;
  icon: 'created' | 'activated' | 'deactivated' | 'edited';
  user: string;
  action: string;
  date: string;
}

function generateHistoryEntries(connector: Automation): HistoryEntry[] {
  const createdDate = new Date(connector.createdAt);
  const updatedDate = new Date(connector.updatedAt);

  const fmt = (d: Date) => {
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} at ${hours}:${mins}`;
  };

  const entries: HistoryEntry[] = [
    {
      id: '1',
      icon: 'created',
      user: 'Brad K.',
      action: `Created automation "${connector.name}"`,
      date: fmt(createdDate),
    },
    {
      id: '2',
      icon: 'activated',
      user: 'Brad K.',
      action: 'Activated automation',
      date: fmt(new Date(createdDate.getTime() + 60000)),
    },
  ];

  if (connector.status === 'paused') {
    entries.push({
      id: '3',
      icon: 'deactivated',
      user: 'Sarah M.',
      action: 'Paused automation',
      date: fmt(new Date(updatedDate.getTime() - 86400000)),
    });
  }

  entries.push({
    id: '4',
    icon: 'edited',
    user: 'Brad K.',
    action: 'Updated schedule and file pattern settings',
    date: fmt(updatedDate),
  });

  return entries.reverse();
}

const ICON_CONFIG = {
  created: { Icon: Plus, color: '#14B88A', bg: 'rgba(20, 184, 138, 0.12)' },
  activated: { Icon: Play, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  deactivated: { Icon: Pause, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  edited: { Icon: PencilSimple, color: '#71717A', bg: 'rgba(113, 113, 122, 0.12)' },
};

export function HistoryModal({ connector, onClose }: HistoryModalProps) {
  const entries = generateHistoryEntries(connector);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="history-title">
      <div className="bg-background rounded-lg shadow-xl w-[480px] max-w-[90vw] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 id="history-title" className="text-lg font-semibold text-foreground m-0">History</h2>
            <p className="text-[13px] text-muted-foreground mt-1 mb-0">{connector.name}</p>
          </div>
          <button type="button" className="inline-flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-colors duration-150 hover:bg-secondary hover:text-foreground" onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col">
            {entries.map((entry, idx) => {
              const cfg = ICON_CONFIG[entry.icon];
              const IconComponent = cfg.Icon;
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0" style={{ backgroundColor: cfg.bg }}>
                      <IconComponent size={14} weight="bold" color={cfg.color} />
                    </div>
                    {idx < entries.length - 1 && <div className="w-0.5 flex-1 min-h-4 bg-border" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-5">
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
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end">
          <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded cursor-pointer transition-colors duration-150 hover:bg-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
