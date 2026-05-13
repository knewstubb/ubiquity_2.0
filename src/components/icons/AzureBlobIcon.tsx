import { cn } from '@/lib/utils'

interface AzureBlobIconProps {
  size?: number
  className?: string
  weight?: 'regular' | 'fill'
}

export function AzureBlobIcon({ size = 24, className, weight = 'fill' }: AzureBlobIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      {weight === 'fill' ? (
        <>
          <rect x="2.5" y="2.5" width="8" height="8" rx="1.5" fill="currentColor"/>
          <rect x="13.5" y="2.5" width="8" height="8" rx="1.5" fill="currentColor"/>
          <rect x="2.5" y="13.5" width="8" height="8" rx="1.5" fill="currentColor"/>
          <rect x="13.5" y="13.5" width="8" height="8" rx="1.5" fill="currentColor"/>
        </>
      ) : (
        <>
          <rect x="2.5" y="2.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2"/>
          <rect x="13.5" y="2.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2"/>
          <rect x="2.5" y="13.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2"/>
          <rect x="13.5" y="13.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2"/>
        </>
      )}
    </svg>
  )
}
