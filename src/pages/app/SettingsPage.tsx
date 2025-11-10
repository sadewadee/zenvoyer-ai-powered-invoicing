import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className="mt-4">
            <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
            <CardContent><p>Profile settings form placeholder...</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="business">
          <Card className="mt-4">
            <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
            <CardContent><p>Business settings form placeholder...</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subscription">
          <Card className="mt-4">
            <CardHeader><CardTitle>Manage Subscription</CardTitle></CardHeader>
            <CardContent><p>Subscription details placeholder...</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card className="mt-4">
            <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
            <CardContent><p>Sub-user management placeholder...</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}