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
import { usePlatformSettingsStore } from '@/stores/use-platform-settings-store';
import { Toaster, toast } from 'sonner';
const gatewaySchema = z.object({
  name: z.enum(['Xendit', 'Midtrans', 'PayPal', 'Stripe']),
  isEnabled: z.boolean(),
  apiKey: z.string(),
  apiSecret: z.string(),
});
const formSchema = z.object({
  Xendit: gatewaySchema.omit({ name: true }),
  Midtrans: gatewaySchema.omit({ name: true }),
});
type FormValues = z.infer<typeof formSchema>;
export function SubscriptionGatewaySettings() {
  const settings = usePlatformSettingsStore((state) => state.settings);
  const updateSettings = usePlatformSettingsStore((state) => state.updateSettings);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: settings?.subscriptionGateways,
  });
  useEffect(() => {
    if (settings) {
      form.reset(settings.subscriptionGateways);
    }
  }, [settings, form]);
  const onSubmit = async (values: FormValues) => {
    const fullValues = {
      Xendit: { ...values.Xendit, name: 'Xendit' as const },
      Midtrans: { ...values.Midtrans, name: 'Midtrans' as const },
    };
    await updateSettings({ subscriptionGateways: fullValues });
    toast.success('Subscription gateway settings saved successfully!');
  };
  if (!settings) {
    return <div>Loading settings...</div>;
  }
  const gatewayNames = Object.keys(settings.subscriptionGateways) as Array<keyof FormValues>;
  return (
    <>
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle>Subscription Payment Gateways</CardTitle>
          <CardDescription>Configure the payment gateways used to charge users for Pro subscriptions.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <Accordion type="multiple" className="w-full" defaultValue={['Xendit']}>
                {gatewayNames.map((gatewayName) => (
                  <AccordionItem value={gatewayName} key={gatewayName}>
                    <AccordionTrigger className="text-lg font-medium">{gatewayName}</AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name={`${gatewayName}.isEnabled`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable {gatewayName} for Subscriptions</FormLabel>
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