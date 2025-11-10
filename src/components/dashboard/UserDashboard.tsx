import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, Activity, PlusCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useInvoiceStore } from "@/stores/use-invoice-store";
import { useClientStore } from "@/stores/use-client-store";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const chartData = [
  { name: 'Jan', income: 4000 }, { name: 'Feb', income: 3000 },
  { name: 'Mar', income: 5000 }, { name: 'Apr', income: 4500 },
  { name: 'May', income: 6000 }, { name: 'Jun', income: 5500 },
];
interface UserDashboardProps {
  isNewUser: boolean;
}
export function UserDashboard({ isNewUser }: UserDashboardProps) {
  const navigate = useNavigate();
  const invoices = useInvoiceStore(state => state.invoices);
  const clients = useClientStore(state => state.clients);
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.total, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;
  const kpiCards = [
    { title: "Total Revenue", icon: DollarSign, value: `${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "All time" },
    { title: "Clients", icon: Users, value: clients.length.toString(), change: "Total clients" },
    { title: "Paid Invoices", icon: FileText, value: invoices.filter(inv => inv.status === 'Paid').length.toString(), change: `out of ${invoices.length}` },
    { title: "Overdue", icon: Activity, value: overdueInvoices.toString(), change: `${overdueInvoices > 0 ? 'Action required' : 'All clear!'}` },
  ];
  return (
    <div className="space-y-8">
      {isNewUser && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-primary-800 text-primary-50 border-primary-700">
            <CardHeader>
              <CardTitle>Get Started with Zenvoyer</CardTitle>
              <CardDescription className="text-primary-200">You're all set! Here are a few things you can do to get started.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Button variant="secondary" onClick={() => navigate('/app/invoices')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Invoice
              </Button>
              <Button variant="outline" className="bg-transparent text-white hover:bg-primary-700 hover:text-white" onClick={() => navigate('/app/clients')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add a New Client
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, index) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
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
                <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}