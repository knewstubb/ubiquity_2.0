import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface PaginationDemoProps {
  'total-pages'?: number
  'current-page'?: number
  'show-ellipsis'?: boolean
  size?: string
}

export default function PaginationDemo(props: PaginationDemoProps) {
  const hasControls = props['total-pages'] !== undefined
  const size = (props.size as 'default' | 'sm') ?? 'default'

  if (hasControls) {
    const totalPages = (props['total-pages'] as number) ?? 10
    const currentPage = Math.min((props['current-page'] as number) ?? 1, totalPages)
    const showEllipsis = props['show-ellipsis'] ?? true

    // Build page numbers to display
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 5 || !showEllipsis) {
      for (let i = 1; i <= Math.min(totalPages, 7); i++) pages.push(i)
    } else {
      // Always show first page
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      // Pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      // Always show last page
      pages.push(totalPages)
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" size={size} />
          </PaginationItem>
          {pages.map((page, i) =>
            page === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis className={size === 'sm' ? 'h-7 w-7' : undefined} />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink href="#" isActive={page === currentPage} size={size}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext href="#" size={size} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">12</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
