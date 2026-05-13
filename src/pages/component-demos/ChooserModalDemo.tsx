import { useState } from 'react'
import { CloudArrowDown, CloudArrowUp, Database, PlugsConnected } from '@phosphor-icons/react'
import { ChooserModal } from '@/components/composed/chooser-modal'
import type { ChooserOption } from '@/components/composed/chooser-modal'
import { Button } from '@/components/ui/button'
import type { ControlValue } from '@/data/componentRegistry'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChooserModalDemoProps {
  title?: string
  description?: string
  'option-count'?: number
  'confirm-label'?: string
  [key: string]: ControlValue | undefined
}

// ─── Sample options ──────────────────────────────────────────────────────────

const allOptions: ChooserOption[] = [
  { id: 'pull', icon: <CloudArrowDown size={28} weight="light" />, label: 'Pull Data' },
  { id: 'push', icon: <CloudArrowUp size={28} weight="light" />, label: 'Push Data' },
  { id: 'database', icon: <Database size={28} weight="light" />, label: 'Database' },
  { id: 'api', icon: <PlugsConnected size={28} weight="light" />, label: 'REST API' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChooserModalDemo(props: ChooserModalDemoProps) {
  // State
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Derived from controls
  const title = (props.title as string) || 'Select Connection Type'
  const description =
    (props.description as string) ||
    'Select the protocol your data source uses to connect with UbiQuity.'
  const optionCount = Number(props['option-count'] ?? 3)
  const confirmLabel = (props['confirm-label'] as string) || 'Next'

  const options = allOptions.slice(0, optionCount)

  // Handlers
  function handleConfirm() {
    setOpen(false)
    setSelectedId(null)
  }

  function handleCancel() {
    setOpen(false)
    setSelectedId(null)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <Button onClick={() => setOpen(true)}>Open Chooser Modal</Button>

      <ChooserModal
        open={open}
        onOpenChange={setOpen}
        icon={<PlugsConnected size={48} weight="light" />}
        title={title}
        description={description}
        options={options}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmLabel={confirmLabel}
        confirmDisabled={selectedId === null}
      />

      {/* Static preview for when modal is closed */}
      <p className="text-sm text-muted-foreground">
        Click the button above to open the ChooserModal.
      </p>
    </div>
  )
}
