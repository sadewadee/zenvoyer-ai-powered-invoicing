import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function SuperAdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <Card>
        <CardHeader><CardTitle>Platform Statistics</CardTitle></CardHeader>
        <CardContent><p>Platform-wide statistics placeholder...</p></CardContent>
      </Card>
    </div>
  );
}