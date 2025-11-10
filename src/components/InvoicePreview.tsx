import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Invoice, InvoiceStatus } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
const statusColors: Record<InvoiceStatus, string> = {
  Paid: "border-transparent bg-status-paid-bg text-status-paid",
  Unpaid: "border-transparent bg-status-unpaid-bg text-status-unpaid",
  Overdue: "border-transparent bg-status-overdue-bg text-status-overdue",
  Draft: "border-transparent bg-status-draft-bg text-status-draft",
  Partial: "border-transparent bg-status-partial-bg text-status-partial"
};
interface InvoicePreviewProps {
  invoice: Invoice;
}
export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const discountAmount = invoice.subtotal * (invoice.discount / 100);
  const taxAmount = (invoice.subtotal - discountAmount) * (invoice.tax / 100);
  return (
    <Card className="max-w-4xl mx-auto shadow-lg print:shadow-none print:border-none">
      <CardContent className="p-8 md:p-12">
        <header className="flex justify-between items-start pb-6 mb-8 border-b-2 border-primary-700">
          <div>
            <h1 className="text-4xl font-bold text-primary-800">INVOICE</h1>
            <p className="text-muted-foreground mt-1">Invoice #: {invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-800">Zenitho Inc.</h2>
            <p className="text-sm text-muted-foreground">123 Cloud Ave, Internet City</p>
          </div>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="font-bold text-gray-800">{invoice.client.name}</p>
            <p className="text-muted-foreground text-sm">{invoice.client.address}</p>
            <p className="text-muted-foreground text-sm">{invoice.client.email}</p>
          </div>
          <div className="md:col-span-2 md:text-right">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">Issue Date</p>
                <p className="font-medium text-gray-800">{format(new Date(invoice.issueDate), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Due Date</p>
                <p className="font-medium text-gray-800">{format(new Date(invoice.dueDate), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-primary-700">${invoice.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Status</p>
                <Badge variant="outline" className={cn("font-semibold text-base mt-1", statusColors[invoice.status])}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          </div>
        </section>
        <section className="mb-10">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-1/2">Description</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
        <section className="flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Discount ({invoice.discount}%)</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({invoice.tax}%)</span>
              <span>+${taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-bold text-xl text-gray-800">
              <span>Grand Total</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </section>
        <footer className="mt-12 pt-6 border-t text-center text-muted-foreground text-sm">
          <p>Thank you for your business!</p>
          <p>If you have any questions, please contact us at support@zenitho.app.</p>
        </footer>
      </CardContent>
    </Card>
  );
}