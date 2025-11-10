import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
export function ProductsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products & Services</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Product management functionality will be implemented in a future phase.</p>
            <p>You will be able to add, edit, and manage your products and services here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}