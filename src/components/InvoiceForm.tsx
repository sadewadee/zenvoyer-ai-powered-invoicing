import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useClientStore } from '@/stores/use-client-store';
import { useInvoiceStore } from '@/stores/use-invoice-store';
import type { Invoice, Client } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuthStore } from '@/stores/use-auth-store';
const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be > 0').default(1),
  unitPrice: z.coerce.number().min(0.01, 'Price must be > 0').default(0.01),
  total: z.number().optional(),
});
const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.date(),
  dueDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  discount: z.coerce.number().min(0).max(100).default(0),
  tax: z.coerce.number().min(0).max(100).default(0),
  amountPaid: z.coerce.number().min(0).default(0),
  status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft', 'Partial']),
});
type InvoiceFormValues = z.infer<typeof invoiceSchema>;
interface InvoiceFormProps {
  invoice?: Invoice;
  onClose: () => void;
}
export function InvoiceForm({ invoice, onClose }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clients = useClientStore(state => state.clients);
  const addInvoice = useInvoiceStore(state => state.addInvoice);
  const updateInvoice = useInvoiceStore(state => state.updateInvoice);
  const getNextInvoiceNumber = useInvoiceStore(state => state.getNextInvoiceNumber);
  const { can } = usePermissions();
  const { isPro } = useSubscription();
  const user = useAuthStore(state => state.user);
  const readOnly = !can('invoices:edit');
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: invoice
      ? {
          clientId: invoice.client.id,
          issueDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          lineItems: invoice.lineItems.map(item => ({ ...item })),
          discount: invoice.discount,
          tax: invoice.tax,
          amountPaid: invoice.amountPaid || 0,
          status: invoice.status,
        }
      : {
          clientId: '',
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          lineItems: [{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0.01, total: 0.01 }],
          discount: 0,
          tax: 10,
          amountPaid: 0,
          status: 'Draft',
        },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });
  const watchedValues = useWatch({ control: form.control });

  const subtotal = (watchedValues.lineItems || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const discountAmount = subtotal * ((watchedValues.discount || 0) / 100);
  const taxAmount = (subtotal - discountAmount) * ((watchedValues.tax || 0) / 100);
  const total = subtotal - discountAmount + taxAmount;
  const balanceDue = total - (watchedValues.amountPaid || 0);
  async function onSubmit(data: InvoiceFormValues) {
    setIsSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === data.clientId);
      if (!selectedClient) {
        console.error("Client not found");
        return;
      }
      const finalLineItems = data.lineItems.map(item => ({
        ...item,
        total: (item.quantity || 0) * (item.unitPrice || 0),
      }));
      if (invoice) {
        const payload: Invoice = {
          ...invoice,
          client: selectedClient,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          lineItems: finalLineItems,
          discount: data.discount,
          tax: data.tax,
          amountPaid: data.amountPaid,
          status: data.status,
          subtotal,
          total,
        };
        await updateInvoice(payload);
      } else {
        if (!user) {
          console.error("User not found");
          return;
        }
        const payload: Omit<Invoice, 'id'> = {
          invoiceNumber: getNextInvoiceNumber(),
          client: selectedClient,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          lineItems: finalLineItems,
          discount: data.discount,
          tax: data.tax,
          amountPaid: data.amountPaid,
          status: data.status,
          subtotal,
          total,
          activityLog: [{ date: new Date(), action: 'Invoice Created' }],
        };
        await addInvoice(payload, user.id);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client: Client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={readOnly}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={readOnly} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={readOnly}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={readOnly} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Label>Line Items</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => <Input {...field} placeholder="Item description" disabled={readOnly} />}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.quantity`}
                      render={({ field }) => (
                        <Input type="number" {...field} placeholder="1" disabled={readOnly} />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.unitPrice`}
                      render={({ field }) => (
                        <Input type="number" step="0.01" {...field} placeholder="0.00" disabled={readOnly} />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    ${((watchedValues.lineItems?.[index]?.quantity || 0) * (watchedValues.lineItems?.[index]?.unitPrice || 0)).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1 || readOnly}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!readOnly && (
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ id: uuidv4(), description: '', quantity: 1, unitPrice: 0.01, total: 0.01 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          )}
        </div>
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="discount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (%)</FormLabel>
                  <FormControl><Input type="number" {...field} disabled={readOnly} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="tax" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax (%)</FormLabel>
                  <FormControl><Input type="number" {...field} disabled={readOnly} /></FormControl>
                </FormItem>
              )} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>+${taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <FormField control={form.control} name="amountPaid" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Paid</FormLabel>
                  <FormControl><Input type="number" {...field} disabled={readOnly || !isPro} /></FormControl>
                  {!isPro && <FormDescription className="text-xs">Partial payments are a Pro feature.</FormDescription>}
                </FormItem>
              )} />
              <div className="flex justify-between font-bold text-lg text-primary-700 dark:text-primary-400"><span>Balance Due</span><span>${balanceDue.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="w-full max-w-xs">
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || (watchedValues.amountPaid || 0) > 0}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['Draft', 'Unpaid', 'Paid', 'Partial', 'Overdue'].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(watchedValues.amountPaid || 0) > 0 && <FormDescription className="text-xs">Status is automatically updated based on payment.</FormDescription>}
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          {!readOnly && <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}</Button>}
        </div>
      </form>
    </Form>
  );
}