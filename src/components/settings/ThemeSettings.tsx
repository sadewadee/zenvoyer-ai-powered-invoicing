import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
const themes = [
  { name: 'Zenvoyer Blue', color: '221.2 83.2% 53.3%' },
  { name: 'Emerald', color: '142.1 76.2% 36.3%' },
  { name: 'Crimson', color: '0 72.2% 50.6%' },
  { name: 'Violet', color: '262.1 83.3% 57.8%' },
  { name: 'Amber', color: '38 92.1% 50.2%' },
];
export function ThemeSettings() {
  const [mounted, setMounted] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('221.2 83.2% 53.3%');
  useEffect(() => {
    const storedColor = localStorage.getItem('zenvoyer-theme');
    if (storedColor) {
      setPrimaryColor(storedColor);
      document.documentElement.style.setProperty('--primary-hsl', storedColor);
    }
    setMounted(true);
  }, []);
  const handleThemeChange = (color: string) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty('--primary-hsl', color);
    localStorage.setItem('zenvoyer-theme', color);
  };
  const handleSaveChanges = () => {
    toast.success('Theme saved successfully!');
  };
  if (!mounted) {
    return null;
  }
  return (
    <>
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle>Theme Customization</CardTitle>
          <CardDescription>Personalize the look and feel of your workspace. (Pro Feature)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Primary Color
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.color)}
                  className={cn(
                    'h-20 w-full rounded-lg border-2 flex items-center justify-center transition-all',
                    primaryColor === theme.color ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                  )}
                  style={{ backgroundColor: `hsl(${theme.color})` }}
                >
                  {primaryColor === theme.color && <Check className="h-8 w-8 text-white" />}
                  <span className="sr-only">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </CardFooter>
      </Card>
    </>
  );
}