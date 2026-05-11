import { useState } from 'react'
import { CardSelector } from '@/components/composed/card-selector'
import { NumberStepper } from '@/components/composed/number-stepper'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DownloadSimple,
  UploadSimple,
  CloudArrowUp,
  Folder,
  Database,
  Globe,
  Lightning,
  Gear,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const ICON_OPTIONS: { value: string; label: string; icon: Icon }[] = [
  { value: 'DownloadSimple', label: 'Download', icon: DownloadSimple },
  { value: 'UploadSimple', label: 'Upload', icon: UploadSimple },
  { value: 'CloudArrowUp', label: 'Cloud', icon: CloudArrowUp },
  { value: 'Folder', label: 'Folder', icon: Folder },
  { value: 'Database', label: 'Database', icon: Database },
  { value: 'Globe', label: 'Globe', icon: Globe },
  { value: 'Lightning', label: 'Lightning', icon: Lightning },
  { value: 'Gear', label: 'Gear', icon: Gear },
]

const DEFAULT_LABELS = ['Importer', 'Exporter', 'Sync', 'Custom', 'Advanced', 'Archive', 'Stream', 'Batch', 'Manual']
const DEFAULT_ICONS = ['DownloadSimple', 'UploadSimple', 'CloudArrowUp', 'Folder', 'Database', 'Globe', 'Lightning', 'Gear', 'DownloadSimple']

export default function CardSelectorDemo() {
  const [count, setCount] = useState(3)
  const [labels, setLabels] = useState<string[]>(DEFAULT_LABELS)
  const [icons, setIcons] = useState<string[]>(DEFAULT_ICONS)
  const [selected, setSelected] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [maxWidth, setMaxWidth] = useState([100])
  const [rows, setRows] = useState(1)

  function getIconComponent(iconName: string): Icon {
    return ICON_OPTIONS.find((o) => o.value === iconName)?.icon ?? DownloadSimple
  }

  function handleLabelChange(index: number, value: string) {
    setLabels((prev) => prev.map((l, i) => (i === index ? value : l)))
  }

  function handleIconChange(index: number, value: string) {
    setIcons((prev) => prev.map((ic, i) => (i === index ? value : ic)))
  }

  const columns = Math.ceil(count / rows)

  return (
    <div className="flex gap-4 items-stretch">
      {/* Preview frame */}
      <div className="flex-1 min-w-0 border border-border rounded-lg p-8 flex items-center justify-center">
        <div className="w-full" style={{ maxWidth: `${maxWidth[0]}%` }}>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: count }).map((_, i) => {
              const IconComp = getIconComponent(icons[i])
              return (
                <CardSelector
                  key={i}
                  icon={<IconComp size={24} />}
                  label={labels[i]}
                  selected={selected === i}
                  disabled={disabled}
                  onClick={() => setSelected(i)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Controller panel */}
      <div className="w-64 shrink-0 ml-auto p-4 bg-secondary rounded-lg space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Card Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cards</span>
          <NumberStepper value={count} onValueChange={setCount} min={2} max={9} size="sm" variant="plain" />
        </div>

        {/* Rows */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rows</span>
          <NumberStepper value={rows} onValueChange={setRows} min={1} max={5} size="sm" variant="plain" />
        </div>

        {/* Width */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Width</span>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider value={maxWidth} onValueChange={setMaxWidth} min={30} max={100} step={1} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-8 text-right">{maxWidth[0]}%</span>
          </div>
        </div>

        {/* Disabled */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disabled</span>
          <Switch checked={disabled} onCheckedChange={setDisabled} />
        </div>

        {/* Cards config — label + icon per row */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Card Labels & Icons</span>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex gap-1.5">
              <Input
                value={labels[i]}
                onChange={(e) => handleLabelChange(i, e.target.value)}
                disabled={i >= count}
                className="h-7 text-xs flex-1"
                placeholder={`Card ${i + 1}`}
              />
              <Select
                value={icons[i]}
                onValueChange={(val) => handleIconChange(i, val)}
                disabled={i >= count}
              >
                <SelectTrigger className="h-7 w-10 text-xs px-2">
                  <SelectValue>
                    {(() => { const IC = getIconComponent(icons[i]); return <IC size={14} /> })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <OptIcon size={14} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
