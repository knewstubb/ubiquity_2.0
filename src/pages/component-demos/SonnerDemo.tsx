import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function SonnerDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => toast('Campaign saved successfully')}
        >
          Default Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success('Contacts imported', {
            description: '1,234 contacts were added to your database.',
          })}
        >
          Success Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error('Import failed', {
            description: 'The CSV file contains invalid data in row 42.',
          })}
        >
          Error Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.warning('Approaching limit', {
            description: 'You have used 80% of your monthly sending quota.',
          })}
        >
          Warning Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Campaign scheduled', {
            description: 'Will send at 9:00 AM tomorrow.',
            action: {
              label: 'Undo',
              onClick: () => toast('Schedule cancelled'),
            },
          })}
        >
          Toast with Action
        </Button>
      </div>
    </div>
  )
}
