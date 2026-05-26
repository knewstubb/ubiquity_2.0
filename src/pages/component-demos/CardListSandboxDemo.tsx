import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CaretRight, DotsThreeVertical, DotsSixVertical, PlugsConnected, FolderOpen, Package, SquaresFour } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

// Sample data
interface CardItem {
  id: string
  icon: React.ReactNode
  protocol: string
  name: string
  status: 'connected' | 'error' | 'inactive'
  meta: string
  children?: { id: string; name: string; status: 'active' | 'paused'; meta: string }[]
}

const ITEMS: CardItem[] = [
  {
    id: '1',
    icon: <Package size={20} weight="regular" />,
    protocol: 'AWS S3',
    name: 'Spa AWS S3 Bucket',
    status: 'connected',
    meta: '4 of 5 automations active',
    children: [
      { id: '1a', name: 'Daily Contact Import', status: 'active', meta: 'Completed · 2 min ago' },
      { id: '1b', name: 'Treatment History Sync', status: 'active', meta: 'Completed · 2 min ago' },
      { id: '1c', name: 'Product Catalogue Import', status: 'paused', meta: 'Paused' },
    ],
  },
  {
    id: '2',
    icon: <FolderOpen size={20} weight="regular" />,
    protocol: 'SFTP',
    name: 'Spa SFTP Server',
    status: 'connected',
    meta: '3 of 3 automations active',
    children: [
      { id: '2a', name: 'Contact Export to CRM', status: 'active', meta: 'Completed · 2 min ago' },
      { id: '2b', name: 'Booking Data Import', status: 'active', meta: 'Completed · 2 min ago' },
    ],
  },
  {
    id: '3',
    icon: <Package size={20} weight="regular" />,
    protocol: 'AWS S3',
    name: 'Spa Legacy AWS S3 Import',
    status: 'error',
    meta: 'Connection error',
    children: [
      { id: '3a', name: 'Legacy Contact Sync', status: 'active', meta: 'Completed · 2 min ago' },
    ],
  },
  {
    id: '4',
    icon: <SquaresFour size={20} weight="regular" />,
    protocol: 'Azure Blob',
    name: 'Spa Azure Blob Storage',
    status: 'connected',
    meta: '0 automations',
  },
]

type CardDensity = 'compact' | 'default' | 'relaxed'
type ContainerStyle = 'borderless' | 'bordered' | 'card'

const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'relaxed', label: 'Relaxed' },
]

const CONTAINER_OPTIONS = [
  { value: 'borderless', label: 'Borderless' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'card', label: 'Card' },
]

export default function CardListSandboxDemo() {
  const [density, setDensity] = useState<CardDensity>('default')
  const [container, setContainer] = useState<ContainerStyle>('borderless')
  const [expandable, setExpandable] = useState(true)
  const [showIcon, setShowIcon] = useState(true)
  const [showProtocol, setShowProtocol] = useState(true)
  const [showActions, setShowActions] = useState(true)
  const [showStatus, setShowStatus] = useState(true)
  const [showNested, setShowNested] = useState(true)
  const [reorderable, setReorderable] = useState(false)

  const isDirty = density !== 'default' || container !== 'borderless' || !expandable || !showIcon || !showProtocol || !showActions || !showStatus || !showNested || reorderable

  function handleReset() {
    setDensity('default')
    setContainer('borderless')
    setExpandable(true)
    setShowIcon(true)
    setShowProtocol(true)
    setShowActions(true)
    setShowStatus(true)
    setShowNested(true)
    setReorderable(false)
  }

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1']))
  const [items, setItems] = useState(ITEMS)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function toggleExpand(id: string) {
    if (!expandable) return
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
      const reordered = [...items]
      const [moved] = reordered.splice(dragIndex, 1)
      reordered.splice(dropIndex, 0, moved)
      setItems(reordered)
      setDragIndex(null)
      setDragOverIndex(null)
    },
    [dragIndex, items],
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  const densityClasses: Record<CardDensity, string> = {
    compact: 'py-2 px-3',
    default: 'py-3 px-4',
    relaxed: 'py-4 px-5',
  }

  const containerClasses: Record<ContainerStyle, string> = {
    borderless: 'flex flex-col gap-2',
    bordered: 'border border-border rounded-md overflow-hidden divide-y divide-border',
    card: 'flex flex-col gap-3',
  }

  const itemClasses: Record<ContainerStyle, string> = {
    borderless: 'border border-border rounded-md',
    bordered: '',
    card: 'border border-border rounded-lg shadow-sm',
  }

  const statusVariants: Record<string, string> = {
    connected: 'success-subtle',
    error: 'error-subtle',
    inactive: 'neutral-subtle',
  }

  return (
    <div className="flex gap-4 items-stretch">
      {/* List preview */}
      <div className="flex-1 min-w-0">
        <div className={cn(containerClasses[container])}>
          {items.map((item, index) => {
            const isExpanded = expanded.has(item.id)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.id} className={cn(
                itemClasses[container],
                reorderable && dragOverIndex === index && "mt-2 transition-[margin] duration-150",
              )}>
                {/* Parent row */}
                <div
                  className={cn(
                    "flex items-center gap-3 transition-all duration-150",
                    densityClasses[density],
                    expandable && hasChildren && "cursor-pointer hover:bg-secondary",
                    reorderable && "cursor-grab active:cursor-grabbing",
                    item.status === 'error' && "border-l-[3px] border-l-destructive pl-[calc(1rem-3px)]",
                    dragIndex === index && "opacity-50 shadow-md scale-[1.01]",
                  )}
                  onClick={() => hasChildren && toggleExpand(item.id)}
                  draggable={reorderable}
                  onDragStart={reorderable ? () => handleDragStart(index) : undefined}
                  onDragOver={reorderable ? (e) => handleDragOver(e, index) : undefined}
                  onDrop={reorderable ? (e) => handleDrop(e, index) : undefined}
                  onDragEnd={reorderable ? handleDragEnd : undefined}
                >
                  {/* Drag handle */}
                  {reorderable && (
                    <DotsSixVertical size={16} weight="bold" className="text-muted-foreground shrink-0" />
                  )}

                  {/* Expand caret */}
                  {expandable && hasChildren && (
                    <CaretRight
                      size={14}
                      weight="bold"
                      className={cn(
                        "text-muted-foreground shrink-0 transition-transform duration-150",
                        isExpanded && "rotate-90",
                      )}
                    />
                  )}

                  {/* Icon */}
                  {showIcon && (
                    <span className={cn(
                      "shrink-0",
                      item.status === 'error' ? "text-destructive" : "text-muted-foreground",
                    )}>
                      {item.icon}
                    </span>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    {showProtocol && (
                      <span className="text-xs text-muted-foreground font-medium shrink-0">{item.protocol}:</span>
                    )}
                    <span className={cn(
                      "text-sm font-semibold truncate",
                      item.status === 'error' ? "text-destructive" : "text-foreground",
                    )}>
                      {item.name}
                    </span>
                  </div>

                  {/* Meta / Status */}
                  {showStatus && (
                    <span className="text-xs text-muted-foreground shrink-0">{item.meta}</span>
                  )}

                  {/* Actions */}
                  {showActions && (
                    <button type="button" className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 bg-transparent border-none cursor-pointer">
                      <DotsThreeVertical size={16} weight="bold" />
                    </button>
                  )}
                </div>

                {/* Nested children */}
                {showNested && expandable && hasChildren && (
                  <div
                    className={cn(
                      "border-t border-border overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "grid grid-rows-[1fr] opacity-100" : "grid grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="min-h-0">
                      {item.children!.map((child) => (
                        <div
                          key={child.id}
                          className={cn(
                            "flex items-center gap-3 pl-10 border-b border-border last:border-b-0 hover:bg-secondary transition-colors duration-150",
                            density === 'compact' ? 'py-1.5 pr-3' : density === 'relaxed' ? 'py-3 pr-5' : 'py-2.5 pr-4',
                          )}
                        >
                          <span className="text-sm text-foreground flex-1">{child.name}</span>
                          <span className="text-xs text-muted-foreground">{child.meta}</span>
                          <Switch checked={child.status === 'active'} onCheckedChange={() => {}} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls panel */}
      <div className="w-56 shrink-0 bg-secondary rounded-lg p-4 flex flex-col">
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Density</h4>
            <Select value={density} onValueChange={(v) => setDensity(v as CardDensity)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DENSITY_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Container</h4>
            <Select value={container} onValueChange={(v) => setContainer(v as ContainerStyle)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTAINER_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2.5 pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="expandable" className="text-sm font-medium text-muted-foreground">Expandable</Label>
              <Switch size="sm" id="expandable" checked={expandable} onCheckedChange={setExpandable} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reorderable" className="text-sm font-medium text-muted-foreground">Reorderable</Label>
              <Switch size="sm" id="reorderable" checked={reorderable} onCheckedChange={setReorderable} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-icon" className="text-sm font-medium text-muted-foreground">Show Icon</Label>
              <Switch size="sm" id="show-icon" checked={showIcon} onCheckedChange={setShowIcon} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-protocol" className="text-sm font-medium text-muted-foreground">Show Protocol</Label>
              <Switch size="sm" id="show-protocol" checked={showProtocol} onCheckedChange={setShowProtocol} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-status" className="text-sm font-medium text-muted-foreground">Show Meta</Label>
              <Switch size="sm" id="show-status" checked={showStatus} onCheckedChange={setShowStatus} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-actions" className="text-sm font-medium text-muted-foreground">Show Actions</Label>
              <Switch size="sm" id="show-actions" checked={showActions} onCheckedChange={setShowActions} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-nested" className="text-sm font-medium text-muted-foreground">Show Nested</Label>
              <Switch size="sm" id="show-nested" checked={showNested} onCheckedChange={setShowNested} />
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
