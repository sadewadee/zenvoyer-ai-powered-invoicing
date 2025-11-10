import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionGatewaySettings } from "@/components/admin/SubscriptionGatewaySettings";
export function PlatformSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Platform Settings</h1>
      <Tabs defaultValue="subscription-gateways" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscription-gateways">Subscription Gateways</TabsTrigger>
          <TabsTrigger value="general" disabled>General</TabsTrigger>
          <TabsTrigger value="email" disabled>Email</TabsTrigger>
        </TabsList>
        <TabsContent value="subscription-gateways">
          <SubscriptionGatewaySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}