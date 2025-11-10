import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { useInvoiceStore } from "@/stores/use-invoice-store";
import { InvoiceForm } from "@/components/InvoiceForm";
import type { Invoice, InvoiceStatus } from "@/types";
import { format } from "date-fns";function cn<T = unknown>(...args: unknown[]): T | null {console.warn('cn is not implemented', args);return null as T | null;}
const statusColors: Record<InvoiceStatus, string> = {
  Paid: "border-transparent bg-status-paid-bg text-status-paid",
  Unpaid: "border-transparent bg-status-unpaid-bg text-status-unpaid",
  Overdue: "border-transparent bg-status-overdue-bg text-status-overdue",
  Draft: "border-transparent bg-status-draft-bg text-status-draft",
  Partial: "border-transparent bg-status-partial-bg text-status-partial"
};
export function InvoicesPage() {
  const invoices = useInvoiceStore((state) => state.invoices);
  const deleteInvoice = useInvoiceStore((state) => state.deleteInvoice);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  };
  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteAlertOpen(true);
  };
  const confirmDelete = () => {
    if (selectedInvoice) {
      deleteInvoice(selectedInvoice.id);
    }
    setIsDeleteAlertOpen(false);
    setSelectedInvoice(undefined);
  };
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedInvoice(undefined);
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Dialog open={isFormOpen} onOpenChange={(open) => {if (!open) handleFormClose();else setIsFormOpen(true);}}>
          <DialogTrigger asChild>
            <Button onClick={() => {setSelectedInvoice(undefined);setIsFormOpen(true);}}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto p-1 pr-4">
              <InvoiceForm invoice={selectedInvoice} onClose={handleFormClose} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) =>
              <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn("font-semibold", statusColors[invoice.status])}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(invoice)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice
              <span className="font-bold"> {selectedInvoice?.invoiceNumber}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedInvoice(undefined)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}