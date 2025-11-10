import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
interface UpgradePromptProps {
  featureName: string;
  isPage?: boolean;
}
export function UpgradePrompt({ featureName, isPage = false }: UpgradePromptProps) {
  const location = useLocation();
  if (isPage) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg text-center w-full">
          <CardHeader>
            <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/20 rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle>Upgrade to Pro to use {featureName}</CardTitle>
            <CardDescription>
              This feature is exclusively available for our Pro plan subscribers. Upgrade now to unlock this and many other powerful features.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/app/settings" state={{ from: location.pathname, defaultTab: 'subscription' }}>
                Upgrade to Pro
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  return (
    <div className="p-2 text-sm text-left">
      <p className="font-semibold flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-400" />
        {featureName} is a Pro feature
      </p>
      <p className="text-muted-foreground mt-1">
        Upgrade your plan to unlock this and more.
      </p>
      <Button size="sm" className="mt-2 w-full" asChild>
        <Link to="/app/settings" state={{ from: location.pathname, defaultTab: 'subscription' }}>
          Upgrade to Pro
        </Link>
      </Button>
    </div>
  );
}