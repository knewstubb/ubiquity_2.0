import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Warning, WarningCircle } from '@phosphor-icons/react'

export default function AlertDemo() {
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
