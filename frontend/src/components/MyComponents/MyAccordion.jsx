import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

function MyDialog({ children }) {
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

export default MyDialog