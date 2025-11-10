import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ticket, Clock, CheckCircle, MoreHorizontal } from "lucide-react";
import { useSupportTicketStore } from "@/stores/use-support-ticket-store";
import { formatDistanceToNow } from "date-fns";
import { Toaster, toast } from "sonner";
import type { SupportTicketStatus } from "@/types";
export function SupportPage() {
  const { tickets, isLoading, updateStatus } = useSupportTicketStore();
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const kpiCards = [
    { title: "Open Tickets", icon: Ticket, value: openTickets.toString() },
    { title: "In Progress", icon: Clock, value: inProgressTickets.toString() },
    { title: "Resolved", icon: CheckCircle, value: resolvedTickets.toString() },
  ];
  const handleStatusChange = async (ticketId: string, status: SupportTicketStatus) => {
    try {
      await updateStatus(ticketId, status);
      toast.success(`Ticket ${ticketId} status updated to ${status}.`);
    } catch (error) {
      toast.error("Failed to update ticket status.");
    }
  };
  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Support Dashboard</h1>
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
            <CardTitle>Support Ticket Queue</CardTitle>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center">Loading tickets...</TableCell></TableRow>
                ) : tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{ticket.userEmail}</TableCell>
                    <TableCell>
                      <Badge variant={
                        ticket.status === 'Open' ? 'destructive' :
                        ticket.status === 'In Progress' ? 'outline' :
                        'default'
                      }>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.priority}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'Open')}>Set as Open</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'In Progress')}>Set as In Progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'Resolved')}>Set as Resolved</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}