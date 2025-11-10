import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, UserX, UserCheck } from 'lucide-react';
import { useUserManagementStore } from '@/stores/use-user-management-store';
import type { ManagedUser } from '@/types';
import type { UserRole } from '@/lib/auth';
import { Toaster, toast } from 'sonner';
const roleSchema = z.object({
  role: z.enum(['USER', 'SUB_USER', 'ADMIN', 'SUPER_ADMIN']),
});
type RoleFormValues = z.infer<typeof roleSchema>;
export function SuperAdminPage() {
  const { users, updateUserRole, toggleUserStatus } = useUserManagementStore();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  });
  const handleEditRole = (user: ManagedUser) => {
    setSelectedUser(user);
    form.setValue('role', user.role);
    setIsRoleDialogOpen(true);
  };
  const handleToggleBan = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };
  const onRoleSubmit = async (data: RoleFormValues) => {
    if (selectedUser) {
      try {
        await updateUserRole(selectedUser.id, data.role);
        toast.success(`Role for ${selectedUser.name} updated to ${data.role}.`);
      } catch (error) {
        toast.error((error as Error).message);
      }
    }
    setIsRoleDialogOpen(false);
    setSelectedUser(null);
  };
  const confirmToggleBan = async () => {
    if (selectedUser) {
      try {
        await toggleUserStatus(selectedUser.id);
        toast.success(`Status for ${selectedUser.name} has been updated.`);
      } catch (error) {
        toast.error((error as Error).message);
      }
    }
    setIsBanDialogOpen(false);
    setSelectedUser(null);
  };
  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Platform Users</CardTitle>
            <CardDescription>View, manage roles, and update status for all users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(user.createdAt, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRole(user)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleBan(user)} className={user.status === 'Active' ? 'text-red-600' : 'text-green-600'}>
                            {user.status === 'Active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            {user.status === 'Active' ? 'Ban User' : 'Unban User'}
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
      </div>
      {/* Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role for {selectedUser?.name}</DialogTitle>
            <DialogDescription>Select a new role for this user.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onRoleSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['USER', 'SUB_USER', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]).map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Ban/Unban Confirmation Dialog */}
      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {selectedUser?.status === 'Active' ? 'ban' : 'unban'} the user <span className="font-bold">{selectedUser?.name}</span>.
              They will {selectedUser?.status === 'Active' ? 'lose' : 'regain'} access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleBan} className={selectedUser?.status === 'Active' ? "bg-destructive hover:bg-destructive/90" : ""}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}