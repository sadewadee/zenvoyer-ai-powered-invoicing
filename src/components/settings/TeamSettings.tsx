import { useState, useEffect } from 'react';
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
import type { SubUser, Permission } from '@/types';
import { Toaster, toast } from 'sonner';
const userPermissions: { id: Permission; label: string; group: string }[] = [
  { id: 'dashboard:view', label: 'View Dashboard', group: 'General' },
  { id: 'invoices:view', label: 'View Invoices', group: 'Invoices' },
  { id: 'invoices:create', label: 'Create Invoices', group: 'Invoices' },
  { id: 'invoices:edit', label: 'Edit Invoices', group: 'Invoices' },
  { id: 'invoices:delete', label: 'Delete Invoices', group: 'Invoices' },
  { id: 'clients:view', label: 'View Clients', group: 'Clients' },
  { id: 'clients:create', label: 'Create Clients', group: 'Clients' },
  { id: 'clients:edit', label: 'Edit Clients', group: 'Clients' },
  { id: 'clients:delete', label: 'Delete Clients', group: 'Clients' },
  { id: 'products:view', label: 'View Products', group: 'Products' },
  { id: 'products:create', label: 'Create Products', group: 'Products' },
  { id: 'products:edit', label: 'Edit Products', group: 'Products' },
  { id: 'products:delete', label: 'Delete Products', group: 'Products' },
  { id: 'reports:view', label: 'View Reports', group: 'General' },
  { id: 'settings:view', label: 'View Settings', group: 'General' },
];
const permissionsSchema = z.object(
  userPermissions.reduce((acc, perm) => {
    acc[perm.id] = z.boolean();
    return acc;
  }, {} as Record<Permission, z.ZodBoolean>)
);
const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  permissions: permissionsSchema,
});
type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
const permissionGroups = userPermissions.reduce((acc, perm) => {
  if (!acc[perm.group]) {
    acc[perm.group] = [];
  }
  acc[perm.group].push(perm);
  return acc;
}, {} as Record<string, { id: Permission; label: string }[]>);
export function TeamSettings() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, fetchTeamMembers, isLoading } = useTeamStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<SubUser | undefined>(undefined);
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);
  const defaultPermissions = userPermissions.reduce((acc, perm) => {
    acc[perm.id] = perm.id === 'dashboard:view';
    return acc;
  }, {} as Record<Permission, boolean>);
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      permissions: defaultPermissions as any,
    },
  });
  const handleOpenForm = (member?: SubUser) => {
    setSelectedMember(member);
    if (member) {
      form.reset({
        name: member.name,
        email: member.email,
        permissions: { ...defaultPermissions, ...member.permissions } as any,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        permissions: defaultPermissions as any,
      });
    }
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMember(undefined);
    form.reset();
  };
  const onSubmit = async (values: TeamMemberFormValues) => {
    try {
      if (selectedMember) {
        await updateTeamMember({ ...selectedMember, ...values });
        toast.success('Team member updated!');
      } else {
        await addTeamMember(values);
        toast.success('Invitation sent to new team member!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteTeamMember(id);
      toast.success('Team member removed.');
    } catch (error) {
      toast.error((error as Error).message);
    }
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
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading team members...</TableCell></TableRow>
              ) : (
                teamMembers.map((member) => (
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
                          <DropdownMenuItem onClick={() => handleDelete(member.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMember ? 'Edit Permissions' : 'Invite New Member'}</DialogTitle>
            <DialogDescription>
              {selectedMember ? `Update permissions for ${selectedMember.name}.` : 'Enter the details to invite a new member to your team.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled={!!selectedMember} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled={!!selectedMember} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div>
                <FormLabel>Permissions</FormLabel>
                <div className="mt-2 rounded-md border p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(permissionGroups).map(([groupName, perms]) => (
                    <div key={groupName} className="space-y-2">
                      <h4 className="font-medium text-sm">{groupName}</h4>
                      {perms.map((p) => (
                        <FormField
                          key={p.id}
                          control={form.control}
                          name={`permissions.${p.id}`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel className="font-normal text-sm">{p.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
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