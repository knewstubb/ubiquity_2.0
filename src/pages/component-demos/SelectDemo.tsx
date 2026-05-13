import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// --- Types ---

interface SelectDemoProps {
  placeholder?: string
  size?: string
  'option-count'?: number
  'show-groups'?: boolean
  disabled?: boolean
}

// --- Sample data ---

const allSegments = [
  { value: 'gold', label: 'Gold Members' },
  { value: 'silver', label: 'Silver Members' },
  { value: 'new', label: 'New Subscribers' },
  { value: 'vip', label: 'VIP Customers' },
  { value: 'inactive', label: 'Inactive Users' },
  { value: 'churned', label: 'Churned Customers' },
]

// --- Component ---

export default function SelectDemo({
  placeholder = 'Select a segment',
  size = 'default',
  'option-count': optionCount = 3,
  'show-groups': showGroups = true,
  disabled = false,
}: SelectDemoProps) {
  // Derived
  const sizeClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-10' : 'h-9'
  const visibleSegments = allSegments.slice(0, optionCount)

  // When grouped, split into Active (first half) and Archived (second half)
  const midpoint = Math.ceil(visibleSegments.length / 2)
  const activeGroup = visibleSegments.slice(0, midpoint)
  const archivedGroup = visibleSegments.slice(midpoint)

  // Render
  return (
    <div className="w-64">
      <Select disabled={disabled}>
        <SelectTrigger className={cn(sizeClass)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {showGroups ? (
            <>
              <SelectGroup>
                <SelectLabel>Active</SelectLabel>
                {activeGroup.map((seg) => (
                  <SelectItem key={seg.value} value={seg.value}>
                    {seg.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Archived</SelectLabel>
                {archivedGroup.map((seg) => (
                  <SelectItem key={seg.value} value={seg.value}>
                    {seg.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : (
            visibleSegments.map((seg) => (
              <SelectItem key={seg.value} value={seg.value}>
                {seg.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
