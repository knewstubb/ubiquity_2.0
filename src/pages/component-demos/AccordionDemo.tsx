import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function AccordionDemo() {
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
