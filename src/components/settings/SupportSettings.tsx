import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSupportTicketStore } from '@/stores/use-support-ticket-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { Toaster, toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
const supportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  message: z.string().min(20, 'Message must be at least 20 characters.'),
});
type SupportFormValues = z.infer<typeof supportSchema>;
export function SupportSettings() {
  const user = useAuthStore(state => state.user);
  const { tickets, addTicket } = useSupportTicketStore();
  const userTickets = tickets.filter(t => t.userId === user?.id);
  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { subject: '', message: '' },
  });
  const onSubmit = async (values: SupportFormValues) => {
    if (!user) {
      toast.error('You must be logged in to submit a ticket.');
      return;
    }
    try {
      await addTicket({
        userId: user.id,
        userEmail: user.email,
        subject: values.subject,
        message: values.message,
      });
      toast.success('Support ticket submitted successfully!');
      form.reset();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to submit ticket.');
    }
  };
  return (
    <>
      <Toaster position="top-right" />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Ticket</CardTitle>
            <CardDescription>Having an issue? Let us know and we'll get back to you.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl><Input placeholder="e.g., Invoice PDF issue" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl><Textarea placeholder="Please describe your issue in detail..." {...field} rows={6} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Submit Ticket</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Ticket History</CardTitle>
            <CardDescription>View the status of your past and current support tickets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userTickets.length > 0 ? userTickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell><Badge variant={ticket.status === 'Resolved' ? 'default' : 'outline'}>{ticket.status}</Badge></TableCell>
                    <TableCell>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="text-center">You have not submitted any tickets.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}