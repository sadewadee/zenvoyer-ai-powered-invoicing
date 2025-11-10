import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import { useUserManagementStore } from "@/stores/use-user-management-store";
import { useAuthStore } from "../../lib/auth";
import { Toaster, toast } from "sonner";
const plans = [
{
  name: "Free",
  price: "Rp0",
  description: "For individuals and freelancers getting started.",
  features: [
  "Unlimited Invoices",
  "Up to 10 Clients",
  "Up to 10 Products",
  "Basic Reporting"],

  cta: "Your Current Plan"
},
{
  name: "Pro",
  price: "Rp50,000",
  priceUnit: "/ month",
  description: "For growing businesses and agencies.",
  features: [
  "Everything in Free, plus:",
  "Unlimited Clients & Products",
  "Advanced Reporting & Profit Tracking",
  "Team Management (Sub-users)",
  "Payment Gateway Integration"],

  cta: "Upgrade to Pro"
}];

export function SubscriptionSettings() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const users = useUserManagementStore((state) => state.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const currentPlan = currentUser?.plan || 'Free';
  const handleUpgrade = () => {
    toast.success("Congratulations! You've upgraded to the Pro plan.");
  };
  const handleManageBilling = () => {
    toast.info("Billing portal coming soon!");
  };
  return (
    <>
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
          <CardDescription>You are currently on the <span className="font-semibold text-primary-700">{currentPlan}</span> plan.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) =>
          <Card key={plan.name} className={plan.name === currentPlan ? "border-primary-700 border-2" : ""}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.name === "Pro" && <Star className="h-6 w-6 text-yellow-400" />}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.priceUnit && <span className="text-muted-foreground">{plan.priceUnit}</span>}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) =>
                <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-zen-secondary-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                )}
                </ul>
                {plan.name === currentPlan ?
              <Button className="w-full" variant="outline" onClick={handleManageBilling}>
                    Manage Billing
                  </Button> :

              <Button className="w-full" onClick={handleUpgrade}>
                    {plan.cta}
                  </Button>
              }
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </>);

}