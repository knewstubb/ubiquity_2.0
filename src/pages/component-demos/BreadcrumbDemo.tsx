import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbDemoProps {
  'item-count'?: number
  'show-ellipsis'?: boolean
}

const BREADCRUMB_ITEMS = ['Home', 'Campaigns', 'Summer Sale 2024', 'Journey Builder', 'Email Step']

export default function BreadcrumbDemo(props: BreadcrumbDemoProps) {
  const hasControls = props['item-count'] !== undefined

  if (!hasControls) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Campaigns</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Summer Sale 2024</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const itemCount = props['item-count'] ?? 3
  const showEllipsis = props['show-ellipsis'] ?? false
  const items = BREADCRUMB_ITEMS.slice(0, itemCount)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1

          // Show ellipsis after first item if enabled and there are 4+ items
          if (showEllipsis && i === 1 && items.length > 3) {
            return (
              <BreadcrumbItem key="ellipsis">
                <BreadcrumbSeparator />
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
            )
          }

          // Skip middle items when ellipsis is shown
          if (showEllipsis && i > 1 && i < items.length - 1 && items.length > 3) {
            return null
          }

          return (
            <BreadcrumbItem key={item}>
              {i > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>{item}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                  {item}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
