import { Plus, Play, Pause, PencilSimple } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { ModalHeader } from '../composed/modal-header'
import { ModalFooter } from '../composed/modal-footer'
import { Timeline, type TimelineEntry } from '../composed/timeline'
import type { Automation } from '../../models/automation'

interface HistoryModalProps {
  connector: Automation
  onClose: () => void
}

function formatDate(d: Date): string {
  const day = d.getDate()
  const month = d.toLocaleString('en-GB', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month}, ${year}`
}

function generateHistoryEntries(connector: Automation): TimelineEntry[] {
  const createdDate = new Date(connector.createdAt)
  const updatedDate = new Date(connector.updatedAt)

  const entries: TimelineEntry[] = []

  // Most recent first
  if (connector.status === 'paused') {
    entries.push({
      id: 'deactivated',
      icon: <Pause size={16} weight="bold" className="text-destructive" />,
      iconBg: 'rgba(239, 68, 68, 0.1)',
      content: (
        <span>
          <span className="font-semibold">Alan Campbell</span> changed the status from <span className="font-semibold">Active</span> to <span className="font-semibold">Inactive</span>
        </span>
      ),
      date: formatDate(updatedDate),
    })
  }

  entries.push({
    id: 'edited',
    icon: <PencilSimple size={16} weight="bold" className="text-info" />,
    iconBg: 'rgba(56, 189, 248, 0.1)',
    content: (
      <span>
        <span className="font-semibold">Alex Lee</span> edited <span className="font-semibold">{connector.name}</span>
      </span>
    ),
    date: formatDate(new Date(updatedDate.getTime() - 86400000 * 13)),
  })

  entries.push({
    id: 'activated',
    icon: <Play size={16} weight="bold" className="text-primary" />,
    iconBg: 'rgba(20, 184, 138, 0.1)',
    content: (
      <span>
        <span className="font-semibold">Jane Smith</span> changed the status from <span className="font-semibold">Inactive</span> to <span className="font-semibold">Active</span>
      </span>
    ),
    date: formatDate(new Date(updatedDate.getTime() - 86400000 * 18)),
  })

  entries.push({
    id: 'created',
    icon: <Plus size={16} weight="bold" className="text-muted-foreground" />,
    iconBg: 'rgba(113, 113, 122, 0.1)',
    content: (
      <span>
        <span className="font-semibold">Sam Thomas</span> created <span className="font-semibold">{connector.name}</span>
      </span>
    ),
    date: formatDate(createdDate),
  })

  return entries
}

export function HistoryModal({ connector, onClose }: HistoryModalProps) {
  const entries = generateHistoryEntries(connector)

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-[480px] p-0 gap-0">
        <DialogTitle className="sr-only">Connector History</DialogTitle>
        <DialogDescription className="sr-only">
          Change history for {connector.name}
        </DialogDescription>

        <ModalHeader
          title="Connector History"
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Timeline entries={entries} />
        </div>

        <ModalFooter
          primaryAction={{ label: 'Close', onClick: onClose }}
        />
      </DialogContent>
    </Dialog>
  )
}
