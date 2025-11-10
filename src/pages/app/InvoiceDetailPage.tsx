import { useParams, useNavigate, Link } from 'react-router-dom';
import { useInvoiceStore } from '@/stores/use-invoice-store';
import { Button } from '@/components/ui/button';
import { InvoicePreview } from '@/components/InvoicePreview';
import { InvoiceActivityLog } from '@/components/InvoiceActivityLog';
import { ArrowLeft, Download, Printer, Send, Clipboard } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Toaster, toast } from 'sonner';
import { useSubscription } from '@/hooks/use-subscription';
export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getInvoiceById = useInvoiceStore((state) => state.getInvoiceById);
  const { isPro } = useSubscription();
  const invoice = id ? getInvoiceById(id) : undefined;
  const handleSendInvoice = () => {
    toast.success(`Invoice ${invoice?.invoiceNumber} sent successfully!`);
  };
  const handleShareInvoice = () => {
    if (!invoice) return;
    const url = `${window.location.origin}/share/invoice/${invoice.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Shareable link copied to clipboard!');
    }, () => {
      toast.error('Failed to copy link.');
    });
  };
  const handleDownloadPdf = () => {
    if (!invoice) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(`Issue Date: ${format(invoice.issueDate, 'MMM d, yyyy')}`, 14, 35);
    doc.text(`Due Date: ${format(invoice.dueDate, 'MMM d, yyyy')}`, 14, 40);
    doc.text("Zenvoyer Inc.", 200, 22, { align: 'right' });
    doc.text("123 Cloud Ave, Internet City", 200, 27, { align: 'right' });
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 60);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.client.name, 14, 65);
    doc.text(invoice.client.address, 14, 70);
    doc.text(invoice.client.email, 14, 75);
    const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
    const tableRows: (string | number)[][] = [];
    invoice.lineItems.forEach((item) => {
      const itemData = [
        item.description,
        item.quantity,
        `${item.unitPrice.toFixed(2)}`,
        `${item.total.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'striped',
      headStyles: { fillColor: [26, 63, 122] }
    });
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text(`Subtotal: ${invoice.subtotal.toFixed(2)}`, 200, finalY + 10, { align: 'right' });
    doc.text(`Discount (${invoice.discount}%): -${(invoice.subtotal * invoice.discount / 100).toFixed(2)}`, 200, finalY + 17, { align: 'right' });
    doc.text(`Tax (${invoice.tax}%): +${((invoice.subtotal - (invoice.subtotal * invoice.discount / 100)) * invoice.tax / 100).toFixed(2)}`, 200, finalY + 24, { align: 'right' });
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${invoice.total.toFixed(2)}`, 200, finalY + 31, { align: 'right' });
    doc.setFontSize(10);
    doc.text("Thank you for your business!", 14, 280);
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };
  if (!invoice) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Invoice not found</h2>
        <p className="text-muted-foreground mt-2">The invoice you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/app/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }
  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" onClick={() => navigate('/app/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSendInvoice}>
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
            <Button variant="outline" onClick={handleShareInvoice}>
              <Clipboard className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <InvoicePreview invoice={invoice} />
          </div>
          <div className="lg:col-span-1">
            {isPro && <InvoiceActivityLog activityLog={invoice.activityLog} />}
          </div>
        </div>
      </div>
    </>
  );
}