import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityLogEntry } from "@/types";
import { format } from "date-fns";
import { FileClock } from "lucide-react";
interface InvoiceActivityLogProps {
  activityLog: ActivityLogEntry[];
}
export function InvoiceActivityLog({ activityLog }: InvoiceActivityLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileClock className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>
          <ul className="space-y-6">
            {activityLog.map((entry, index) => (
              <li key={index} className="relative flex items-start gap-4">
                <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary-700 border-4 border-background -translate-x-1/2 ml-3"></div>
                <div className="flex-1">
                  <p className="font-semibold">{entry.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(entry.date, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}