import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { BusinessSettings } from "@/components/settings/BusinessSettings";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { PaymentSettings } from "@/components/settings/PaymentSettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
export function SettingsPage() {
  const { can } = usePermissions();
  const { isPro } = useSubscription();
  const proTabs = [
    { value: 'team', label: 'Team', component: <TeamSettings />, permission: can('team:manage'), featureName: 'Team Management' },
    { value: 'payments', label: 'Payments', component: <PaymentSettings />, permission: true, featureName: 'Payment Gateways' },
    { value: 'theme', label: 'Theme', component: <ThemeSettings />, permission: true, featureName: 'Theme Customization' },
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TooltipProvider>
            {proTabs.map(tab => (
              tab.permission && (
                isPro ? (
                  <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ) : (
                  <Tooltip key={tab.value}>
                    <TooltipTrigger asChild>
                      <TabsTrigger value={tab.value} disabled>{tab.label}</TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <UpgradePrompt featureName={tab.featureName} />
                    </TooltipContent>
                  </Tooltip>
                )
              )
            ))}
          </TooltipProvider>
        </TabsList>
        <TabsContent value="profile"><ProfileSettings /></TabsContent>
        <TabsContent value="business"><BusinessSettings /></TabsContent>
        <TabsContent value="subscription"><SubscriptionSettings /></TabsContent>
        {proTabs.map(tab => (
          tab.permission && (
            <TabsContent key={tab.value} value={tab.value}>
              {isPro ? tab.component : <UpgradePrompt featureName={tab.featureName} isPage />}
            </TabsContent>
          )
        ))}
      </Tabs>
    </div>
  );
}