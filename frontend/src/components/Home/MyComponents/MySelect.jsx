import { Form, FormControl, FormField, FormItem, FormLabel } from "../../ui/form";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "../../ui/select";

function MySelect({ children, placeholder }) {
  // const form = useForm();

  // const onSubmit = (data) => {
  //   console.log(data);
  // }

  return (
    // <Form {...form}>
    //   <form onSubmit={form.handleSubmit(onSubmit)}>
    //     <FormField control={form.control} name={placeholder} render={({ field }) => (
    //       <FormItem>
    //         <FormLabel>{placeholder}</FormLabel>
    <Select onValueChange={(value) => console.log(value)}>
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