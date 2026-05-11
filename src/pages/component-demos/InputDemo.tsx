import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InputDemo() {
  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <div className="grid gap-2">
        <Label htmlFor="default">Default</Label>
        <Input id="default" placeholder="Enter your email" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="with-value">With value</Label>
        <Input id="with-value" defaultValue="sarah@example.com" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" placeholder="Cannot edit" disabled />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="with-error" className="text-destructive">With error</Label>
        <Input id="with-error" className="border-destructive" defaultValue="invalid-email" />
        <p className="text-sm text-destructive">Please enter a valid email address.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
    </div>
  )
}
