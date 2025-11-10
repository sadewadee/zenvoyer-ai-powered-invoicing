import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toast } from 'sonner';
import { useSettingsStore } from '@/stores/use-settings-store';
import type { BusinessDetails } from '@/types';
const businessSchema = z.object({
  companyName: z.string().min(2, 'Company name is required.'),
  address: z.string().min(10, 'Please enter a full address.'),
  taxId: z.string().optional(),
});
type BusinessFormValues = z.infer<typeof businessSchema>;
export function BusinessSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: settings?.business || {
      companyName: '',
      address: '',
      taxId: '',
    },
  });
  useEffect(() => {
    if (settings) {
      form.reset(settings.business);
    }
  }, [settings, form]);
  const onSubmit = async (values: BusinessFormValues) => {
    await updateSettings({ business: values as BusinessDetails });
    toast.success('Business details updated successfully!');
  };
  return (
    <>
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>Manage your company information for invoices.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company LLC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main St..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., VAT, EIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}