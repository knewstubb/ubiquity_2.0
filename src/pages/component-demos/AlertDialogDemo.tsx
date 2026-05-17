import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface AlertDialogDemoProps {
  title?: string
  description?: string
  'confirm-label'?: string
  'cancel-label'?: string
  'confirm-variant'?: string
}

export default function AlertDialogDemo(props: AlertDialogDemoProps) {
  const hasControls = props.title !== undefined

  if (hasControls) {
    const title = (props.title as string) ?? 'Are you sure?'
    const description = (props.description as string) ?? 'This action cannot be undone.'
    const confirmLabel = (props['confirm-label'] as string) ?? 'Continue'
    const cancelLabel = (props['cancel-label'] as string) ?? 'Cancel'
    const confirmVariant = (props['confirm-variant'] as string) ?? 'destructive'

    const actionClassName = confirmVariant === 'destructive'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      : undefined

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Campaign</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction className={actionClassName}>
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Campaign</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign &quot;Summer Sale 2024&quot; and
              all associated analytics data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
