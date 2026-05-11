import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { CaretUpDown } from '@phosphor-icons/react'

export default function CollapsibleDemo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            3 integrations connected
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <CaretUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 text-sm">
          Shopify — Connected
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            Mailchimp — Connected
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            Google Analytics — Connected
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
