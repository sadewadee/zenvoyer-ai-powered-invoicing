import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSettingsStore } from '@/stores/use-settings-store';
import { Toaster, toast } from 'sonner';
const gatewaySchema = z.object({
  name: z.enum(['Xendit', 'Midtrans', 'PayPal', 'Stripe']),
  isEnabled: z.boolean(),
  apiKey: z.string(),
  apiSecret: z.string(),
});
const formSchema = z.object({
  Xendit: gatewaySchema,
  Midtrans: gatewaySchema,
  PayPal: gatewaySchema,
  Stripe: gatewaySchema,
});
type PaymentSettingsFormValues = z.infer<typeof formSchema>;
export function PaymentSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const form = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: settings?.paymentGateways,
  });
  useEffect(() => {
    if (settings) {
      form.reset(settings.paymentGateways);
    }
  }, [settings, form]);
  const onSubmit = async (values: PaymentSettingsFormValues) => {
    await updateSettings({ paymentGateways: values });
    toast.success('Payment settings saved successfully!');
  };
  if (!settings) {
    return <div>Loading settings...</div>;
  }
  return (
    <>
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Configure how you accept payments on your invoices.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <Accordion type="multiple" className="w-full" defaultValue={['Xendit']}>
                {(Object.keys(settings.paymentGateways) as Array<keyof typeof settings.paymentGateways>).map((gatewayName) => (
                  <AccordionItem value={gatewayName} key={gatewayName}>
                    <AccordionTrigger className="text-lg font-medium">{gatewayName}</AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name={`${gatewayName}.isEnabled`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable {gatewayName}</FormLabel>
                              <FormDescription>
                                Allow clients to pay invoices using {gatewayName}.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${gatewayName}.apiKey`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="pk_live_xxxxxxxxxxxx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${gatewayName}.apiSecret`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Secret / Webhook Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="sk_live_xxxxxxxxxxxx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
            <div className="border-t px-6 py-4">
              <Button type="submit">Save All Changes</Button>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
}