import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface AccordionDemoProps {
  'item-count'?: number
  type?: string
  collapsible?: boolean
}

export default function AccordionDemo(props: AccordionDemoProps) {
  const itemCount = props['item-count']
  const type = props.type
  const collapsible = props.collapsible

  const hasControls = itemCount !== undefined

  if (hasControls) {
    const allItems = [
      { title: 'What is UbiQuity?', content: 'UbiQuity is a hybrid CDP/MAP platform designed for SMEs, combining customer data management with marketing automation.' },
      { title: 'How does the AAA framework work?', content: 'The AAA framework stands for Acquire, Analyse, and Act — covering data ingestion, insights, and campaign execution.' },
      { title: 'Is there a free trial?', content: 'Yes, UbiQuity offers a 14-day free trial with full access to all features. No credit card required.' },
      { title: 'What integrations are supported?', content: 'UbiQuity supports REST APIs, SFTP, webhooks, and native connectors for popular CRMs and e-commerce platforms.' },
      { title: 'How is data secured?', content: 'All data is encrypted at rest and in transit. We comply with GDPR and SOC 2 Type II standards.' },
      { title: 'Can I import existing contacts?', content: 'Yes, you can import contacts via CSV, API, or direct database sync from supported platforms.' },
    ]
    const items = allItems.slice(0, itemCount)

    if (type === 'multiple') {
      return (
        <div className="max-w-lg">
          <Accordion type="multiple" className="w-full">
            {items.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )
    }

    return (
      <div className="max-w-lg">
        <Accordion type="single" collapsible={collapsible} className="w-full">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is UbiQuity?</AccordionTrigger>
          <AccordionContent>
            UbiQuity is a hybrid CDP/MAP platform designed for SMEs. It combines
            customer data management with marketing automation in a single,
            intuitive interface.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How does the AAA framework work?</AccordionTrigger>
          <AccordionContent>
            The AAA framework stands for Acquire, Analyse, and Act. Acquire gets
            data in through forms and integrations. Analyse makes sense of it
            with reports and segments. Act lets you build journeys and campaigns.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is there a free trial?</AccordionTrigger>
          <AccordionContent>
            Yes, UbiQuity offers a 14-day free trial with full access to all
            features. No credit card required to get started.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
