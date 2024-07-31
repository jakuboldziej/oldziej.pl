import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/shadcn/accordion";

function MyAccordion({ children, title }) {
  const conrolAccordionOpen = window.innerWidth > 1228;
  return (
    <Accordion type="single" className="accordion" defaultValue={conrolAccordionOpen ? "item-1" : ""} collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default MyAccordion