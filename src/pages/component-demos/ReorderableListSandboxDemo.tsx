import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DragHandle } from '@/components/shared/DragHandle'

interface FieldItem {
  key: string
  label: string
  source: string
}

const ALL_FIELDS: FieldItem[] = [
  { key: 'customer_ref', label: 'Customer Reference', source: 'treatment' },
  { key: 'treatment_type', label: 'Treatment Type', source: 'treatment' },
  { key: 'therapist_name', label: 'Therapist Name', source: 'treatment' },
  { key: 'treatment_date', label: 'Treatment Date', source: 'treatment' },
  { key: 'duration', label: 'Duration (min)', source: 'treatment' },
  { key: 'price', label: 'Price', source: 'treatment' },
  { key: 'customer_id', label: 'Customer ID', source: 'contact' },
  { key: 'first_name', label: 'First Name', source: 'contact' },
  { key: 'last_name', label: 'Last Name', source: 'contact' },
  { key: 'email', label: 'Email Address', source: 'contact' },
  { key: 'phone', label: 'Phone Number', source: 'contact' },
  { key: 'membership', label: 'Membership Tier', source: 'contact' },
]

type ListStyle = 'borderless' | 'bordered' | 'card'
type DragIndicator = 'border-top' | 'gap' | 'highlight'

const LIST_STYLE_OPTIONS = [
  { value: 'borderless', label: 'Borderless' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'card', label: 'Card' },
]

const DRAG_INDICATOR_OPTIONS = [
  { value: 'border-top', label: 'Border top' },
  { value: 'gap', label: 'Gap' },
  { value: 'highlight', label: 'Highlight' },
]

export default function ReorderableListSandboxDemo() {
  const [selected, setSelected] = useState<FieldItem[]>(ALL_FIELDS.slice(0, 4))
  const [listStyle, setListStyle] = useState<ListStyle>('bordered')
  const [dragIndicator, setDragIndicator] = useState<DragIndicator>('border-top')
  const [showIndex, setShowIndex] = useState(true)
  const [showSource, setShowSource] = useState(true)
  const [showSelectAll, setShowSelectAll] = useState(true)

  const isDirty = listStyle !== 'bordered' || dragIndicator !== 'border-top' || !showIndex || !showSource || !showSelectAll

  function handleReset() {
    setListStyle('bordered')
    setDragIndicator('border-top')
    setShowIndex(true)
    setShowSource(true)
    setShowSelectAll(true)
  }

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const unselected = ALL_FIELDS.filter((f) => !selected.some((s) => s.key === f.key))
  const allSelected = selected.length === ALL_FIELDS.length

  function toggleField(field: FieldItem) {
    if (selected.some((s) => s.key === field.key)) {
      setSelected((prev) => prev.filter((s) => s.key !== field.key))
    } else {
      setSelected((prev) => [...prev, field])
    }
  }

  function toggleAll() {
    if (allSelected) setSelected([])
    else setSelected([...ALL_FIELDS])
  }

  const handleDragStart = useCallback((index: number) => { setDragIndex(index) }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (dragIndex === null || dragIndex === index) return
      setDragOverIndex(index)
    },
    [dragIndex],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      if (dragIndex === null || dragIndex === dropIndex) {
        setDragIndex(null)
        setDragOverIndex(null)
        return
      }
      const reordered = [...selected]
      const [moved] = reordered.splice(dragIndex, 1)
      reordered.splice(dropIndex, 0, moved)
      setSelected(reordered)
      setDragIndex(null)
      setDragOverIndex(null)
    },
    [dragIndex, selected],
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  const containerClasses: Record<ListStyle, string> = {
    borderless: '',
    bordered: 'border border-border rounded-md overflow-hidden',
    card: 'border border-border rounded-lg shadow-sm overflow-hidden',
  }

  return (
    <div className="flex gap-4 items-stretch">
      {/* List preview */}
      <div className="flex-1 min-w-0">
        <div className={cn(containerClasses[listStyle])}>
          {/* Select All */}
          {showSelectAll && (
            <div className="flex items-center gap-2 py-2.5 px-3 bg-secondary border-b border-border">
              <Checkbox
                checked={allSelected}
                indeterminate={selected.length > 0 && !allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
              <span className="text-sm font-semibold text-foreground">Select All</span>
            </div>
          )}

          {/* Selected fields — draggable */}
          {selected.map((field, index) => (
            <div
              key={field.key}
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 border-b border-border last:border-b-0 transition-all duration-150 cursor-grab",
                "bg-accent/30 border-l-[3px] border-l-primary pl-[calc(0.75rem-3px)]",
                "hover:bg-accent/50 active:cursor-grabbing",
                dragIndex === index && "opacity-50 shadow-md scale-[1.01] z-[1] relative",
                dragIndicator === 'border-top' && dragOverIndex === index && "border-t-2 border-t-primary",
                dragIndicator === 'highlight' && dragOverIndex === index && "bg-accent",
                dragIndicator === 'gap' && dragOverIndex === index && "mt-2",
              )}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <DragHandle />
              {showIndex && (
                <span className="text-xs text-primary font-semibold min-w-5 text-center shrink-0">{index + 1}</span>
              )}
              <Checkbox
                checked={true}
                onCheckedChange={() => toggleField(field)}
                aria-label={`Deselect ${field.label}`}
              />
              <span className="text-sm text-foreground font-medium flex-1">{field.label}</span>
              {showSource && (
                <Badge variant="neutral-subtle" className="text-[10px]">{field.source}</Badge>
              )}
            </div>
          ))}

          {/* Unselected fields */}
          {unselected.map((field) => (
            <div
              key={field.key}
              className="flex items-center gap-2 py-2.5 px-3 border-b border-border last:border-b-0 bg-background hover:bg-secondary transition-colors duration-150"
            >
              {showIndex && <span className="min-w-5" />}
              <span className="w-4" /> {/* spacer for drag handle alignment */}
              <Checkbox
                checked={false}
                onCheckedChange={() => toggleField(field)}
                aria-label={`Select ${field.label}`}
              />
              <span className="text-sm text-muted-foreground flex-1">{field.label}</span>
              {showSource && (
                <Badge variant="neutral-subtle" className="text-[10px]">{field.source}</Badge>
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground m-0">
          {selected.length} of {ALL_FIELDS.length} fields selected
        </p>
      </div>

      {/* Controls panel */}
      <div className="w-56 shrink-0 bg-secondary rounded-lg p-4 flex flex-col">
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">List Style</h4>
            <Select value={listStyle} onValueChange={(v) => setListStyle(v as ListStyle)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LIST_STYLE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Drag Indicator</h4>
            <Select value={dragIndicator} onValueChange={(v) => setDragIndicator(v as DragIndicator)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DRAG_INDICATOR_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2.5 pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-index" className="text-sm font-medium text-muted-foreground">Show Index</Label>
              <Switch size="sm" id="show-index" checked={showIndex} onCheckedChange={setShowIndex} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-source" className="text-sm font-medium text-muted-foreground">Show Source Badge</Label>
              <Switch size="sm" id="show-source" checked={showSource} onCheckedChange={setShowSource} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-select-all" className="text-sm font-medium text-muted-foreground">Select All Row</Label>
              <Switch size="sm" id="show-select-all" checked={showSelectAll} onCheckedChange={setShowSelectAll} />
            </div>
          </div>
        </div>

        {/* Reset — pinned at bottom */}
        <div className="mt-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full h-7 text-xs" disabled={!isDirty} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
