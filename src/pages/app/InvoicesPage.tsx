import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
const mockInvoices = [
  { id: "INV-001", client: "Acme Inc.", amount: "$2,500.00", status: "Paid", date: "2023-10-25" },
  { id: "INV-002", client: "Stark Industries", amount: "$1,500.00", status: "Unpaid", date: "2023-10-28" },
  { id: "INV-003", client: "Wayne Enterprises", amount: "$3,500.00", status: "Overdue", date: "2023-09-15" },
  { id: "INV-004", client: "Ollivanders", amount: "$500.00", status: "Draft", date: "2023-11-01" },
];
const statusColors: { [key: string]: string } = {
  Paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Unpaid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};
export function InvoicesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>{invoice.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}