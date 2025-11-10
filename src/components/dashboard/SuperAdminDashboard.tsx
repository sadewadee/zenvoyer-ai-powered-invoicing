import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, FileText, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const mockStats = {
  totalUsers: 500,
  activeUsers: 450,
  mrr: 5000000,
  totalRevenue: 50000000,
  totalInvoices: 50000,
  openTickets: 15,
};
const revenueData = [
  { name: 'Jan', revenue: 4000000 }, { name: 'Feb', revenue: 3000000 },
  { name: 'Mar', revenue: 5000000 }, { name: 'Apr', revenue: 4500000 },
  { name: 'May', revenue: 6000000 }, { name: 'Jun', revenue: 5500000 },
];
const userPlanData = [
  { name: 'Free Users', value: 400 },
  { name: 'Pro Users', value: 100 },
];
const COLORS = ['#60A5FA', '#2563EB'];
export function SuperAdminDashboard() {
  const kpiCards = [
    { title: "Total Users", icon: Users, value: mockStats.totalUsers.toLocaleString() },
    { title: "MRR", icon: DollarSign, value: `Rp${(mockStats.mrr / 1000000).toFixed(1)}M` },
    { title: "Total Revenue", icon: DollarSign, value: `Rp${(mockStats.totalRevenue / 1000000).toFixed(1)}M` },
    { title: "Total Invoices", icon: FileText, value: mockStats.totalInvoices.toLocaleString() },
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
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Rp${Number(value) / 1000000}M`} />
                <Tooltip
                  formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value))}
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userPlanData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {userPlanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}