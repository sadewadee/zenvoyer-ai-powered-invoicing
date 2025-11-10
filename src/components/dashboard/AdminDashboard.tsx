import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, CheckCircle } from "lucide-react";
import { useSupportTicketStore } from "@/stores/use-support-ticket-store";
import { formatDistanceToNow } from "date-fns";
export function AdminDashboard() {
  const { tickets, isLoading } = useSupportTicketStore();
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const recentTickets = tickets.filter(t => t.status !== 'Resolved').slice(0, 5);
  const kpiCards = [
    { title: "Open Tickets", icon: Ticket, value: openTickets.toString() },
    { title: "In Progress", icon: Clock, value: inProgressTickets.toString() },
    { title: "Total Resolved", icon: CheckCircle, value: resolvedTickets.toString() },
  ];
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
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading tickets...</TableCell></TableRow>
              ) : recentTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'Open' ? 'destructive' : 'outline'}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.priority}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}