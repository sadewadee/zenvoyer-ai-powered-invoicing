import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useInvoiceStore } from "@/stores/use-invoice-store";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
const chartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 5000, profit: 3800 },
  { name: 'Apr', revenue: 4500, profit: 2900 },
  { name: 'May', revenue: 6000, profit: 4800 },
  { name: 'Jun', revenue: 5500, profit: 3800 },
];
export function ReportsPage() {
  const { isPro } = useSubscription();
  const invoices = useInvoiceStore(state => state.invoices);
  if (!isPro) {
    return <UpgradePrompt featureName="Profit Reporting" isPage />;
  }
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCost = paidInvoices.reduce((acc, inv) =>
    acc + inv.lineItems.reduce((itemAcc, item) => itemAcc + (item.cost || 0) * item.quantity, 0), 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const kpiCards = [
    { title: "Total Revenue", icon: DollarSign, value: `Rp${totalRevenue.toLocaleString('id-ID')}` },
    { title: "Total Costs", icon: TrendingDown, value: `Rp${totalCost.toLocaleString('id-ID')}` },
    { title: "Net Profit", icon: TrendingUp, value: `Rp${netProfit.toLocaleString('id-ID')}` },
    { title: "Profit Margin", icon: Scale, value: `${profitMargin.toFixed(2)}%` },
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profit Report</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs. Profit</CardTitle>
          <CardDescription>Monthly financial performance overview.</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}