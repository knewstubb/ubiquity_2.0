import { PencilSimple, Play, Pause, PlusCircle, Trash, EnvelopeSimple } from '@phosphor-icons/react'
import { Timeline, type TimelineEntry } from '@/components/composed/timeline'

const sampleEntries: TimelineEntry[] = [
  {
    id: '1',
    icon: <PlusCircle size={18} weight="fill" className="text-white" />,
    iconBg: 'var(--color-primary)',
    content: <span><strong>Campaign created</strong> by Brad K.</span>,
    date: '2 Jun 2026, 10:32 am',
  },
  {
    id: '2',
    icon: <PencilSimple size={18} weight="fill" className="text-white" />,
    iconBg: '#3b82f6',
    content: <span>Subject line updated to &ldquo;Winter Sale starts now&rdquo;</span>,
    date: '2 Jun 2026, 11:45 am',
  },
  {
    id: '3',
    icon: <EnvelopeSimple size={18} weight="fill" className="text-white" />,
    iconBg: '#8b5cf6',
    content: <span>Test email sent to <strong>brad@ubiquity.co</strong></span>,
    date: '3 Jun 2026, 9:10 am',
  },
  {
    id: '4',
    icon: <Play size={18} weight="fill" className="text-white" />,
    iconBg: 'var(--color-primary)',
    content: <span>Campaign <strong>activated</strong></span>,
    date: '3 Jun 2026, 2:00 pm',
  },
  {
    id: '5',
    icon: <Pause size={18} weight="fill" className="text-white" />,
    iconBg: '#f59e0b',
    content: <span>Campaign <strong>paused</strong> by Brad K.</span>,
    date: '4 Jun 2026, 8:15 am',
  },
  {
    id: '6',
    icon: <Trash size={18} weight="fill" className="text-white" />,
    iconBg: '#ef4444',
    content: <span>Campaign <strong>archived</strong></span>,
    date: '4 Jun 2026, 4:30 pm',
  },
]

export default function TimelineDemo({ entryCount = 6 }: { entryCount?: number }) {
  const entries = sampleEntries.slice(0, Math.max(1, Math.min(entryCount, 6)))

  return (
    <div className="w-full max-w-md">
      <Timeline entries={entries} />
    </div>
  )
}
