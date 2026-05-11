import { showToast } from '@/components/composed/toast'
import { Button } from '@/components/ui/button'

export default function ToastDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => showToast({ title: 'Changes saved', variant: 'default' })}
        >
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() => showToast({
            title: 'Contacts imported',
            description: '1,234 contacts were added successfully.',
            variant: 'success',
          })}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => showToast({
            title: 'Import failed',
            description: 'Invalid CSV format in row 42.',
            variant: 'error',
          })}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => showToast({
            title: 'Approaching limit',
            description: '80% of monthly quota used.',
            variant: 'warning',
          })}
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() => showToast({
            title: 'Campaign scheduled',
            description: 'Sending at 9:00 AM tomorrow.',
            variant: 'info',
            action: {
              label: 'Undo',
              onClick: () => showToast({ title: 'Schedule cancelled', variant: 'default' }),
            },
          })}
        >
          With Action
        </Button>
      </div>
    </div>
  )
}
