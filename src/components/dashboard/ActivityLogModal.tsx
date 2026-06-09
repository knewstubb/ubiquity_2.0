import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { ModalHeader } from '../composed/modal-header'
import { ModalFooter } from '../composed/modal-footer'
import { ExpandableTable, ExpandableRow, DISCLOSURE_INDENT } from '../composed/expandable-table'
import { Badge } from '../ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '../ui/pagination'
import { cn } from '@/lib/utils'
import type { Automation } from '../../models/automation'

interface ActivityLogModalProps {
  connector: Automation
  onClose: () => void
}

type RunStatus = 'completed' | 'failed' | 'running' | 'skipped'

interface FileResult {
  fileName: string
  status: 'success' | 'error'
  message: string
  isStuck: boolean
}

interface RunEntry {
  id: string
  status: RunStatus
  startTime: string
  endTime: string
  duration: string
  filesProcessed: number
  fileResults: FileResult[]
}

/* ── Sample data ── */

function generateSampleRuns(connector: Automation): RunEntry[] {
  const isImporter = connector.direction === 'import'
  const baseRuns: RunEntry[] = [
    {
      id: 'run-1',
      status: 'failed',
      startTime: '28/05/2026 09:36',
      endTime: '28/05/2026 09:40',
      duration: '4m 24s',
      filesProcessed: 3,
      fileResults: [
        {
          fileName: isImporter ? 'COOP_PRE_RENEWAL_EDM_20260521V1.0.csv' : 'export_contacts_batch1.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
        {
          fileName: isImporter ? 'COOP_PRE_RENEWAL_EDM_20260521V2.0.csv' : 'export_contacts_batch2.csv',
          status: 'error',
          message: 'File exceeds maximum size limit (50MB).',
          isStuck: false,
        },
        {
          fileName: isImporter ? 'COOP_PRE_RENEWAL_EDM_20260521V3.0.csv' : 'export_contacts_batch3.csv',
          status: 'error',
          message: 'Connection timeout after 30s.',
          isStuck: true,
        },
      ],
    },
    {
      id: 'run-2',
      status: 'completed',
      startTime: '28/05/2026 09:11',
      endTime: '28/05/2026 09:16',
      duration: '4m 31s',
      filesProcessed: 2,
      fileResults: [
        {
          fileName: isImporter ? 'LOYALTY_MEMBERS_20260528.csv' : 'export_segment_gold.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
        {
          fileName: isImporter ? 'LOYALTY_TIERS_20260528.csv' : 'export_segment_silver.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
      ],
    },
    {
      id: 'run-3',
      status: 'completed',
      startTime: '27/05/2026 09:00',
      endTime: '27/05/2026 09:04',
      duration: '3m 58s',
      filesProcessed: 4,
      fileResults: [
        {
          fileName: isImporter ? 'COOP_MEMBERS_20260527_A.csv' : 'export_contacts_a.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
        {
          fileName: isImporter ? 'COOP_MEMBERS_20260527_B.csv' : 'export_contacts_b.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
        {
          fileName: isImporter ? 'COOP_MEMBERS_20260527_C.csv' : 'export_contacts_c.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
        {
          fileName: isImporter ? 'COOP_MEMBERS_20260527_D.csv' : 'export_contacts_d.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
      ],
    },
    {
      id: 'run-4',
      status: 'skipped',
      startTime: '26/05/2026 09:00',
      endTime: '26/05/2026 09:00',
      duration: '< 1s',
      filesProcessed: 0,
      fileResults: [],
    },
    {
      id: 'run-5',
      status: 'failed',
      startTime: '25/05/2026 09:00',
      endTime: '25/05/2026 09:05',
      duration: '4m 52s',
      filesProcessed: 2,
      fileResults: [
        {
          fileName: isImporter ? 'COOP_PRE_RENEWAL_EDM_20260519.csv' : 'export_contacts_20260525.csv',
          status: 'success',
          message: 'File imported successfully.',
          isStuck: false,
        },
        {
          fileName: isImporter ? 'COOP_LOYALTY_20260519.csv' : 'export_segments_20260525.csv',
          status: 'error',
          message: 'File exceeds maximum size limit (50MB).',
          isStuck: true,
        },
      ],
    },
  ]

  // Generate 25 entries by repeating the base pattern with offset dates
  const runs: RunEntry[] = []
  for (let i = 0; i < 25; i++) {
    const base = baseRuns[i % baseRuns.length]
    const dayOffset = Math.floor(i / baseRuns.length) * 5 + (i % baseRuns.length)
    const day = String(28 - dayOffset).padStart(2, '0')
    const month = dayOffset > 27 ? '04' : '05'
    runs.push({
      ...base,
      id: `run-${i + 1}`,
      startTime: base.startTime.replace(/\d{2}\/05/, `${day}/${month}`),
      endTime: base.endTime.replace(/\d{2}\/05/, `${day}/${month}`),
    })
  }
  return runs
}

/* ── Status pill ── */

const STATUS_CONFIG: Record<RunStatus, { label: string; variant: 'default' | 'error' | 'neutral-subtle' | 'info-subtle' }> = {
  completed: { label: 'Completed', variant: 'default' },
  failed: { label: 'Failed', variant: 'error' },
  running: { label: 'Running', variant: 'info-subtle' },
  skipped: { label: 'Skipped', variant: 'neutral-subtle' },
}

function StatusBadge({ status }: { status: RunStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

/* ── File result row ── */

function FileResultRow({ result }: { result: FileResult }) {
  return (
    <div className="flex items-center gap-6 py-2 text-sm transition-colors hover:bg-secondary/50" style={{ paddingLeft: 80, paddingRight: 80 }}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          result.status === 'success' ? 'bg-primary' : 'bg-destructive'
        )} />
        <span className="text-foreground truncate">{result.fileName}</span>
      </div>
      <span className="shrink-0 text-muted-foreground text-right">
        {result.message}{result.isStuck && ' · Stuck'}
      </span>
    </div>
  )
}

/* ── Relative time helper ── */

function relativeTime(dateStr: string): string {
  // Parse "DD/MM/YYYY HH:mm" format
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('/')
  const date = new Date(`${year}-${month}-${day}T${timePart}:00`)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 month ago'
  return `${diffMonths} months ago`
}

/* ── Column definitions ── */

const HISTORY_COLUMNS = [
  { key: 'run', label: '', width: '120px' },
  { key: 'status', label: 'Status', width: '90px' },
  { key: 'start', label: 'Run Start', width: '140px' },
  { key: 'end', label: 'Run End', width: '140px' },
  { key: 'duration', label: 'Duration', width: '70px' },
  { key: 'summary', label: 'Summary', width: 'flex-1', align: 'right' as const },
]

/* ── Main component ── */

export function ActivityLogModal({ connector, onClose }: ActivityLogModalProps) {
  const allRuns = generateSampleRuns(connector)
  const pageSize = 10
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(allRuns.length / pageSize)
  const runs = allRuns.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-[1024px] max-h-[80vh] p-0 gap-0 flex flex-col">
        <DialogTitle className="sr-only">Automation History</DialogTitle>
        <DialogDescription className="sr-only">
          Run history for {connector.name}
        </DialogDescription>

        <ModalHeader
          title={connector.name}
          description="Automation History"
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto">
          <ExpandableTable columns={HISTORY_COLUMNS}>
            {runs.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No runs recorded yet.
              </div>
            ) : (
              runs.map((run) => {
                const hasFiles = run.fileResults.length > 0
                const summary = run.fileResults.length === 0
                  ? '—'
                  : (() => {
                      const failed = run.fileResults.filter(f => f.status === 'error').length
                      const succeeded = run.fileResults.filter(f => f.status === 'success').length
                      const stuck = run.fileResults.filter(f => f.isStuck).length
                      if (failed === 0) return `${succeeded}/${run.fileResults.length} succeeded`
                      if (succeeded === 0) return `${failed} failed`
                      const parts = [`${succeeded} ok`, `${failed} failed`]
                      if (stuck > 0) parts.push(`${stuck} stuck`)
                      return parts.join(', ')
                    })()

                return (
                  <ExpandableRow
                    key={run.id}
                    id={run.id}
                    expandable={hasFiles}
                    ariaLabel={`Run ${run.startTime} — ${STATUS_CONFIG[run.status].label}`}
                    cells={[
                      <span key="run" className="w-[120px] shrink-0 text-sm text-foreground">{relativeTime(run.startTime)}</span>,
                      <span key="status" className="w-[90px] shrink-0"><StatusBadge status={run.status} /></span>,
                      <span key="start" className="w-[140px] shrink-0 text-foreground">{run.startTime}</span>,
                      <span key="end" className="w-[140px] shrink-0 text-foreground">{run.endTime}</span>,
                      <span key="duration" className="w-[70px] shrink-0 text-muted-foreground">{run.duration}</span>,
                      <span key="summary" className="flex-1 text-muted-foreground text-xs text-right">{summary}</span>,
                    ]}
                  >
                    <div className="flex flex-col">
                      {run.fileResults.map((result, idx) => (
                        <FileResultRow key={idx} result={result} />
                      ))}
                    </div>
                  </ExpandableRow>
                )
              })
            )}
          </ExpandableTable>
        </div>

        {/* Footer with pagination and close */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, allRuns.length)} of {allRuns.length}
          </span>
          <div className="flex items-center gap-4">
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="sm"
                    onClick={() => page > 0 && setPage((p) => p - 1)}
                    className={cn(page === 0 && 'pointer-events-none opacity-50')}
                    role="button"
                    tabIndex={0}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      size="sm"
                      isActive={i === page}
                      onClick={() => setPage(i)}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    size="sm"
                    onClick={() => page < totalPages - 1 && setPage((p) => p + 1)}
                    className={cn(page >= totalPages - 1 && 'pointer-events-none opacity-50')}
                    role="button"
                    tabIndex={0}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <ModalFooter
          primaryAction={{ label: 'Close', onClick: onClose }}
        />
      </DialogContent>
    </Dialog>
  )
}
