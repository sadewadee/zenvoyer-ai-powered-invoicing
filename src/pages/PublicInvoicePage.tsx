import { useParams, Link } from 'react-router-dom';
import { useInvoiceStore } from '@/stores/use-invoice-store';
import { Button } from '@/components/ui/button';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Sparkles } from 'lucide-react';
export function PublicInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const getInvoiceById = useInvoiceStore((state) => state.getInvoiceById);
  const invoice = id ? getInvoiceById(id) : undefined;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-700">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
            Zenitho
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link to="/login">Sign In</Link>
        </Button>
      </header>
      <main>
        {invoice ? (
          <InvoicePreview invoice={invoice} />
        ) : (
          <div className="text-center py-10 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Invoice Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The invoice link is invalid or the invoice has been deleted.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Go to Homepage</Link>
            </Button>
          </div>
        )}
      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>Powered by Zenitho - AI Invoicing</p>
      </footer>
    </div>
  );
}