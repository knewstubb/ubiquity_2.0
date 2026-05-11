import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface FormValues {
  email: string
  name: string
}

export default function FormDemo() {
  const form = useForm<FormValues>({
    defaultValues: { email: '', name: '' },
  })

  function onSubmit(data: FormValues) {
    alert(`Submitted: ${data.name} (${data.email})`)
  }

  return (
    <div className="max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sarah Chen" {...field} />
                </FormControl>
                <FormDescription>Your full name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/, message: 'Invalid email' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="sarah@example.com" {...field} />
                </FormControl>
                <FormDescription>We&apos;ll never share your email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}
