import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileText, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useInvoiceStore } from "@/stores/use-invoice-store";
import { useClientStore } from "@/stores/use-client-store";
const chartData = [
  { name: 'Jan', income: 4000 }, { name: 'Feb', income: 3000 },
  { name: 'Mar', income: 5000 }, { name: 'Apr', income: 4500 },
  { name: 'May', income: 6000 }, { name: 'Jun', income: 5500 },
];
export function UserDashboard() {
  const invoices = useInvoiceStore(state => state.invoices);
  const clients = useClientStore(state => state.clients);
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.total, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;
  const kpiCards = [
    { title: "Total Revenue", icon: DollarSign, value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "All time" },
    { title: "Clients", icon: Users, value: clients.length.toString(), change: "Total clients" },
    { title: "Paid Invoices", icon: FileText, value: invoices.filter(inv => inv.status === 'Paid').length.toString(), change: `out of ${invoices.length}` },
    { title: "Overdue", icon: Activity, value: overdueInvoices.toString(), change: `${overdueInvoices > 0 ? 'Action required' : 'All clear!'}` },
  ];
  return (
    <div className="space-y-8">
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
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
              <Bar dataKey="income" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}