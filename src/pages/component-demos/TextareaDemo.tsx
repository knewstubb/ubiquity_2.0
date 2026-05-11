import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function TextareaDemo() {
  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div className="grid gap-2">
        <Label htmlFor="message">Campaign description</Label>
        <Textarea id="message" placeholder="Describe your campaign goals..." />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="with-value">With content</Label>
        <Textarea
          id="with-value"
          defaultValue="This campaign targets Gold Members with a special 20% discount offer for the summer collection. Expected send date: July 15, 2024."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="disabled-textarea">Disabled</Label>
        <Textarea id="disabled-textarea" placeholder="Cannot edit" disabled />
      </div>
    </div>
  )
}
