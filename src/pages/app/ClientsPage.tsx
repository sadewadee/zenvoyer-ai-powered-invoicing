import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Upload, Download, Users } from "lucide-react";
import { useClientStore } from "@/stores/use-client-store";
import type { Client } from "@/types";
import { Toaster, toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  address: z.string().min(5, "Address is too short."),
  phone: z.string().min(5, "Phone number is too short."),
});
type ClientFormValues = z.infer<typeof clientSchema>;
const ClientsTableSkeleton = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
export function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient, isLoading } = useClientStore();
  const { can } = usePermissions();
  const { isPro } = useSubscription();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", email: "", address: "", phone: "" },
  });
  const handleOpenForm = (client?: Client) => {
    setSelectedClient(client);
    if (client) {
      form.reset(client);
    } else {
      form.reset({ name: "", email: "", address: "", phone: "" });
    }
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedClient(undefined);
    form.reset();
  };
  const onSubmit = (values: ClientFormValues) => {
    if (selectedClient) {
      updateClient({ ...selectedClient, ...values });
    } else {
      addClient(values);
    }
    handleCloseForm();
  };
  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteAlertOpen(true);
  };
  const confirmDelete = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
    }
    setIsDeleteAlertOpen(false);
    setSelectedClient(undefined);
  };
  const handleExport = () => {
    const headers = ["name", "email", "address", "phone"];
    const csvContent = [
      headers.join(","),
      ...clients.map(client => headers.map(header => `"${client[header as keyof Client]}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "zenvoyer-clients.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Client data exported successfully!");
  };
  const handleImport = () => {
    setIsImportDialogOpen(true);
  };
  const handleMockUpload = () => {
    toast.info("File upload is a demo. In a real app, this would process the CSV.");
    setIsImportDialogOpen(false);
  }
  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Clients</h1>
          <div className="flex gap-2">
            <TooltipProvider>
              {isPro ? (
                <>
                  {can('clients:create') && <Button variant="outline" onClick={handleImport}><Upload className="mr-2 h-4 w-4" /> Import</Button>}
                  {can('clients:view') && <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>}
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" disabled><Upload className="mr-2 h-4 w-4" /> Import</Button>
                    </TooltipTrigger>
                    <TooltipContent><UpgradePrompt featureName="Client Import" /></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" /> Export</Button>
                    </TooltipTrigger>
                    <TooltipContent><UpgradePrompt featureName="Client Export" /></TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
            {can('clients:create') && <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> New Client</Button>}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ClientsTableSkeleton />
            ) : clients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Clients Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first client to start sending invoices.
                </p>
                {can('clients:create') && (
                  <Button className="mt-6" onClick={() => handleOpenForm()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Client
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    {(can('clients:edit') || can('clients:delete')) && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      {(can('clients:edit') || can('clients:delete')) && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {can('clients:edit') && <DropdownMenuItem onClick={() => handleOpenForm(client)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>}
                              {can('clients:delete') && <DropdownMenuItem onClick={() => handleDelete(client)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedClient ? "Edit Client" : "Create New Client"}</DialogTitle>
              <DialogDescription>
                {selectedClient ? "Update the details for this client." : "Add a new client to your list."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                  <Button type="submit">{selectedClient ? "Save Changes" : "Create Client"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the client
                <span className="font-bold"> {selectedClient?.name}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedClient(undefined)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Import Clients</AlertDialogTitle>
              <AlertDialogDescription>
                Upload a CSV file to bulk-import clients. Please ensure your file follows the correct format.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-sm space-y-2">
              <p>Your CSV file must have the following columns in this order:</p>
              <code className="bg-muted p-2 rounded-md block text-xs">name,email,address,phone</code>
              <Button variant="link" size="sm" className="p-0 h-auto">Download Sample CSV</Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleMockUpload}>Upload File</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}