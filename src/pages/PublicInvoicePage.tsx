import { useParams, Link } from 'react-router-dom';
import { useInvoiceStore } from '@/stores/use-invoice-store';
import { useUserManagementStore } from '@/stores/use-user-management-store';
import { useClientStore } from '@/stores/use-client-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';
export function PublicInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const getInvoiceById = useInvoiceStore((state) => state.getInvoiceById);
  const invoice = id ? getInvoiceById(id) : undefined;
  // This is a mock to determine if the invoice owner is a Pro user.
  // In a real app, this data would come from the backend with the invoice.
  const isProUser = true;
  const handlePayment = (gateway: string) => {
    toast.info(`Redirecting to ${gateway} for payment... (demo)`);
  };
  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-700">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
              Zenvoyer
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/login">Sign In</Link>
          </Button>
        </header>
        <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            {invoice ? (
              <InvoicePreview invoice={invoice} />
            ) : (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Invoice Not Found</h2>
                <p className="text-muted-foreground mt-2">
                  The invoice link is invalid or the invoice has been deleted.
                </p>
                <Button asChild className="mt-6">
                  <Link to="/">Go to Homepage</Link>
                </Button>
              </div>
            )}
          </div>
          {invoice && isProUser && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Pay Online</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => handlePayment('Stripe')}>Pay with Stripe</Button>
                  <Button className="w-full" onClick={() => handlePayment('PayPal')}>Pay with PayPal</Button>
                  <Button className="w-full" onClick={() => handlePayment('Xendit')}>Pay with Xendit</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>Powered by Zenvoyer - Professional Invoicing</p>
        </footer>
      </div>
    </>
  );
}