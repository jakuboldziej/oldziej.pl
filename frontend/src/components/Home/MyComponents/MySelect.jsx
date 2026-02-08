import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/shadcn/form";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";

function MySelect({ children, placeholder }) {
  // const form = useForm();

  // const onSubmit = (data) => {
  // }

  return (
    // <Form {...form}>
    //   <form onSubmit={form.handleSubmit(onSubmit)}>
    //     <FormField control={form.control} name={placeholder} render={({ field }) => (
    //       <FormItem>
    //         <FormLabel>{placeholder}</FormLabel>
    <Select>
      <SelectTrigger className="text-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {children}
        </SelectGroup>
      </SelectContent>
    </Select>
    //       </FormItem>
    //     )} />
    //   </form>
    // </Form>
  )
}

export default MySelect