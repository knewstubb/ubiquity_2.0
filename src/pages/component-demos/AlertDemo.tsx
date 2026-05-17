import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Warning, WarningCircle, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AlertDemoProps {
  variant?: string
  title?: string
  description?: string
  'show-icon'?: boolean
}

const VARIANT_CLASSES: Record<string, string> = {
  warning: 'border-warning-border bg-warning-subtle text-warning-foreground [&>svg]:text-warning',
  info: 'border-info-border bg-info-subtle text-info-foreground [&>svg]:text-info',
  success: 'border-success-border bg-success-subtle text-success-foreground [&>svg]:text-success',
}

function getIcon(variant: string) {
  switch (variant) {
    case 'destructive':
      return <WarningCircle className="h-4 w-4" weight="bold" />
    case 'warning':
      return <Warning className="h-4 w-4" weight="bold" />
    case 'info':
      return <Info className="h-4 w-4" weight="bold" />
    case 'success':
      return <CheckCircle className="h-4 w-4" weight="bold" />
    default:
      return <Info className="h-4 w-4" weight="bold" />
  }
}

export default function AlertDemo(props: AlertDemoProps) {
  const hasControls = props.variant !== undefined

  if (hasControls) {
    const variant = (props.variant ?? 'default') as string
    const title = (props.title as string) ?? 'Heads up!'
    const description = (props.description as string) ?? 'You can add components to your app using the CLI.'
    const showIcon = props['show-icon'] ?? true

    // Only pass variant prop for default/destructive (native Alert variants)
    const nativeVariant = (variant === 'default' || variant === 'destructive') ? variant as 'default' | 'destructive' : undefined
    const extraClassName = VARIANT_CLASSES[variant] ?? undefined

    return (
      <div className="max-w-lg">
        <Alert variant={nativeVariant} className={cn(extraClassName)}>
          {showIcon && getIcon(variant)}
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <Alert>
        <Info className="h-4 w-4" weight="bold" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Your campaign has been scheduled and will begin sending at 9:00 AM
          tomorrow.
        </AlertDescription>
      </Alert>

      <Alert className="border-warning-border bg-warning-subtle text-warning-foreground [&>svg]:text-warning">
        <Warning className="h-4 w-4" weight="bold" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Your sending limit is at 80% capacity. Consider upgrading your plan to
          avoid delivery delays.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <WarningCircle className="h-4 w-4" weight="bold" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to sync contacts. Please check your integration settings and
          try again.
        </AlertDescription>
      </Alert>
    </div>
  )
}
