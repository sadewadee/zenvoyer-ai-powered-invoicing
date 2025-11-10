import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, CheckCircle } from "lucide-react";
const mockTickets = [
  { id: 'TKT-001', subject: 'Invoice calculation issue', user: 'user@zenitho.app', status: 'Open', priority: 'High', createdAt: '2 hours ago' },
  { id: 'TKT-002', subject: 'Cannot add new client', user: 'another@example.com', status: 'In Progress', priority: 'Medium', createdAt: '5 hours ago' },
  { id: 'TKT-003', subject: 'PDF download failed', user: 'test@example.com', status: 'Resolved', priority: 'Low', createdAt: '1 day ago' },
];
const kpiCards = [
  { title: "Open Tickets", icon: Ticket, value: "15", change: "2 new today" },
  { title: "Avg. Resolution Time", icon: Clock, value: "2.5 hours", change: "Improving" },
  { title: "Resolved Today", icon: CheckCircle, value: "8", change: "Good work!" },
];
export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
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
          <CardTitle>Recent Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.user}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'Open' ? 'destructive' : ticket.status === 'In Progress' ? 'outline' : 'default'}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.priority}</TableCell>
                  <TableCell>{ticket.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}