import { useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

interface NavigationMenuDemoProps {
  'item-count'?: number
  'dropdown-items'?: number
  'show-descriptions'?: boolean
  orientation?: 'horizontal' | 'vertical'
}

const NAV_LABELS = ['Campaigns', 'Audience', 'Assets', 'Reporting', 'Admin', 'Settings']
const DROPDOWN_LABELS_BY_INDEX: Record<number, string[][]> = {
  0: [['Email Campaigns', 'Create and manage email campaigns.'], ['Journeys', 'Build automated customer journeys.'], ['Segments', 'Target specific audience groups.'], ['Templates', 'Reusable content templates.'], ['Analytics', 'Track performance metrics.']],
  2: [['Brand Assets', 'Manage logos and brand files.'], ['Media Library', 'Upload and organise images.'], ['Design Templates', 'Pre-built email layouts.']],
  4: [['Users', 'Manage team members.'], ['Permissions', 'Configure access roles.'], ['Billing', 'View invoices and plans.']],
}

export default function NavigationMenuDemo(props: NavigationMenuDemoProps) {
  const hasControls = props['item-count'] !== undefined

  if (!hasControls) {
    return <NavigationMenuPreview itemCount={4} dropdownItems={3} showDescriptions={false} orientation="horizontal" />
  }

  return (
    <NavigationMenuPreview
      itemCount={props['item-count'] ?? 4}
      dropdownItems={props['dropdown-items'] ?? 3}
      showDescriptions={props['show-descriptions'] ?? false}
      orientation={(props.orientation ?? 'horizontal') as 'horizontal' | 'vertical'}
    />
  )
}

function NavigationMenuPreview({
  itemCount,
  dropdownItems,
  showDescriptions,
  orientation,
}: {
  itemCount: number
  dropdownItems: number
  showDescriptions: boolean
  orientation: 'horizontal' | 'vertical'
}) {
  const [selectedItem, setSelectedItem] = useState<string>('Email Campaigns')
  const items = NAV_LABELS.slice(0, itemCount)

  return (
    <NavigationMenu orientation={orientation} className={orientation === 'vertical' ? 'flex-col items-start' : ''}>
      <NavigationMenuList className={orientation === 'vertical' ? 'flex-col items-start space-x-0 space-y-1' : ''}>
        {items.map((label, i) => {
          // Items with even index get a dropdown
          if (i % 2 === 0) {
            const dropdownSubItems = (DROPDOWN_LABELS_BY_INDEX[i] ?? DROPDOWN_LABELS_BY_INDEX[0]).slice(0, dropdownItems)
            const isParentActive = dropdownSubItems.some(([name]) => name === selectedItem)

            return (
              <NavigationMenuItem key={label}>
                <NavigationMenuTrigger active={isParentActive}>{label}</NavigationMenuTrigger>
                <NavigationMenuContent className="p-2">
                  <ul className="grid gap-1 w-[220px]">
                    {dropdownSubItems.map(([name, desc]) => (
                      <li key={name}>
                        <NavigationMenuLink asChild active={selectedItem === name}>
                          <a
                            className={cn(
                              "block select-none rounded-md p-2.5 no-underline outline-none transition-colors hover:bg-secondary hover:text-primary text-sm font-medium",
                              selectedItem === name ? "text-primary" : "text-foreground"
                            )}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setSelectedItem(name) }}
                          >
                            {name}
                            {showDescriptions && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{desc}</p>
                            )}
                          </a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          }

          // Odd items are plain links
          return (
            <NavigationMenuItem key={label}>
              <NavigationMenuLink
                active={selectedItem === label}
                className={cn(navigationMenuTriggerStyle(), "relative cursor-pointer")}
                href="#"
                onClick={(e) => { e.preventDefault(); setSelectedItem(label) }}
              >
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
