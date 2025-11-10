import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileText, Activity } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth-store";
const kpiCards = [
    { title: "Total Revenue", icon: DollarSign, value: "$45,231.89", change: "+20.1% from last month" },
    { title: "Clients", icon: Users, value: "+2350", change: "+180.1% from last month" },
    { title: "Paid Invoices", icon: FileText, value: "1,231", change: "+19% from last month" },
    { title: "Overdue", icon: Activity, value: "12", change: "+2 since last month" },
];
export function DashboardPage() {
  const user = useAuthStore(state => state.user);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent><p>Placeholder for recent activity feed...</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Income Chart</CardTitle></CardHeader>
            <CardContent><p>Placeholder for income chart...</p></CardContent>
        </Card>
      </div>
    </div>
  );
}