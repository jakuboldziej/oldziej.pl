import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/shadcn/accordion";

function MyAccordion({ children }) {
  return (
    <Accordion type="single" className="accordion" defaultValue="item-1" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Live Data</AccordionTrigger>
        <AccordionContent>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default MyAccordion