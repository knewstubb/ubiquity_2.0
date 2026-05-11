import { Button } from '@/components/ui/button'

interface ActionBarProps {
  onReset: () => void
  onExport: () => void
}

export function ActionBar({ onReset, onExport }: ActionBarProps) {
  return (
    <div className="flex items-center gap-2 justify-end py-4 border-t border-border mt-6">
      <Button variant="outline" onClick={onReset}>
        Reset to Defaults
      </Button>
      <Button onClick={onExport}>
        Export JSON
      </Button>
    </div>
  )
}
