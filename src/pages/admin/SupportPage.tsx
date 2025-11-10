import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function SupportPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Support Dashboard</h1>
      <Card>
        <CardHeader><CardTitle>Open Support Tickets</CardTitle></CardHeader>
        <CardContent><p>Support ticket queue placeholder...</p></CardContent>
      </Card>
    </div>
  );
}