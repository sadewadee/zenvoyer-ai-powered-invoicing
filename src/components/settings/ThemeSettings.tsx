import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import { useSettingsStore } from '@/stores/use-settings-store';
const themes = [
  { name: 'Zenvoyer Blue', color: '221.2 83.2% 53.3%' },
  { name: 'Emerald', color: '142.1 76.2% 36.3%' },
  { name: 'Crimson', color: '0 72.2% 50.6%' },
  { name: 'Violet', color: '262.1 83.3% 57.8%' },
  { name: 'Amber', color: '38 92.1% 50.2%' },
];
export function ThemeSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const [selectedColor, setSelectedColor] = useState(settings?.theme.primaryColor || themes[0].color);
  useEffect(() => {
    if (settings) {
      const color = settings.theme.primaryColor;
      setSelectedColor(color);
      document.documentElement.style.setProperty('--primary-hsl', color);
    }
  }, [settings]);
  const handleThemeChange = (color: string) => {
    setSelectedColor(color);
    document.documentElement.style.setProperty('--primary-hsl', color);
  };
  const handleSaveChanges = async () => {
    await updateSettings({ theme: { primaryColor: selectedColor } });
    toast.success('Theme saved successfully!');
  };
  if (!settings) {
    return <div>Loading theme settings...</div>;
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
                    selectedColor === theme.color ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                  )}
                  style={{ backgroundColor: `hsl(${theme.color})` }}
                >
                  {selectedColor === theme.color && <Check className="h-8 w-8 text-white" />}
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