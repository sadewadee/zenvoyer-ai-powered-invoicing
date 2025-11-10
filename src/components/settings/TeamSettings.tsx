import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useTeamStore } from '@/stores/use-team-store';
import type { SubUser, SubUserPermissions } from '@/types';
import { Toaster, toast } from 'sonner';
const permissionsSchema = z.object({
  canViewInvoices: z.boolean(),
  canCreateInvoice: z.boolean(),
  canEditInvoice: z.boolean(),
  canDeleteInvoice: z.boolean(),
  canManageClients: z.boolean(),
});
const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  permissions: permissionsSchema,
});
type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
const permissionLabels: { id: keyof SubUserPermissions; label: string }[] = [
  { id: 'canViewInvoices', label: 'View Invoices' },
  { id: 'canCreateInvoice', label: 'Create Invoices' },
  { id: 'canEditInvoice', label: 'Edit Invoices' },
  { id: 'canDeleteInvoice', label: 'Delete Invoices' },
  { id: 'canManageClients', label: 'Manage Clients' },
];
export function TeamSettings() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useTeamStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<SubUser | undefined>(undefined);
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      permissions: {
        canViewInvoices: true,
        canCreateInvoice: false,
        canEditInvoice: false,
        canDeleteInvoice: false,
        canManageClients: false,
      },
    },
  });
  const handleOpenForm = (member?: SubUser) => {
    setSelectedMember(member);
    if (member) {
      form.reset(member);
    } else {
      form.reset({
        name: '',
        email: '',
        permissions: { canViewInvoices: true, canCreateInvoice: false, canEditInvoice: false, canDeleteInvoice: false, canManageClients: false },
      });
    }
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMember(undefined);
    form.reset();
  };
  const onSubmit = (values: TeamMemberFormValues) => {
    if (selectedMember) {
      updateTeamMember({ ...selectedMember, ...values });
      toast.success('Team member updated!');
    } else {
      addTeamMember(values);
      toast.success('Invitation sent to new team member!');
    }
    handleCloseForm();
  };
  return (
    <>
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Invite and manage your team's access.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(member)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteTeamMember(member.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMember ? 'Edit Permissions' : 'Invite New Member'}</DialogTitle>
            <DialogDescription>
              {selectedMember ? `Update permissions for ${selectedMember.name}.` : 'Enter the details to invite a new member to your team.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled={!!selectedMember} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled={!!selectedMember} /></FormControl><FormMessage /></FormItem>
              )} />
              <div>
                <FormLabel>Permissions</FormLabel>
                <div className="space-y-2 mt-2 rounded-md border p-4">
                  {permissionLabels.map((p) => (
                    <FormField
                      key={p.id}
                      control={form.control}
                      name={`permissions.${p.id}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="font-normal">{p.label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                <Button type="submit">{selectedMember ? 'Save Changes' : 'Send Invitation'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}