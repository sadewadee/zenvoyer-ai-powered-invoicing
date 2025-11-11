import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useInvoiceStore } from "@/stores/use-invoice-store";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { format, getMonth, getYear } from 'date-fns';
import { FeatureGate } from "@/components/FeatureGate";
export function ReportsPage() {
  const invoices = useInvoiceStore(state => state.invoices);
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
  const monthlyData = paidInvoices.reduce((acc, invoice) => {
    const month = getMonth(invoice.issueDate);
    const year = getYear(invoice.issueDate);
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (!acc[key]) {
      acc[key] = {
        name: format(invoice.issueDate, 'MMM yy'),
        revenue: 0,
        profit: 0,
      };
    }
    const invoiceCost = invoice.lineItems.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
    acc[key].revenue += invoice.total;
    acc[key].profit += (invoice.total - invoiceCost);
    return acc;
  }, {} as Record<string, { name: string; revenue: number; profit: number }>);
  const chartData = Object.values(monthlyData).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <FeatureGate requiredPlan="Pro" fallback={<UpgradePrompt featureName="Profit Reporting" isPage />}>
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
    </FeatureGate>
  );
}