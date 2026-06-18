import { useState, useEffect } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { CaretUpDown } from '@phosphor-icons/react'

interface CollapsibleDemoProps {
  open?: boolean
  title?: string
}

export default function CollapsibleDemo(props: CollapsibleDemoProps) {
  const hasControls = props.title !== undefined
  const [isOpen, setIsOpen] = useState(false)

  const controlledOpen = props.open ?? false

  useEffect(() => {
    setIsOpen(controlledOpen)
  }, [controlledOpen])

  if (hasControls) {
    const title = (props.title as string) ?? '@peduarte starred 3 repositories'

    return (
      <div className="max-w-sm">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">{title}</h4>
            <CollapsibleTrigger asChild>
              <Button variant="secondaryGhost" size="sm" className="w-9 p-0">
                <CaretUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            @radix-ui/primitives
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-3 text-sm">
              @radix-ui/colors
            </div>
            <div className="rounded-md border px-4 py-3 text-sm">
              @stitches/react
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            3 integrations connected
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="secondaryGhost" size="sm" className="w-9 p-0">
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
