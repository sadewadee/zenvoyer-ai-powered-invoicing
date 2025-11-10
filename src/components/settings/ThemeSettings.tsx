import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Palette, Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import { useSettingsStore } from '@/stores/use-settings-store';
import { useTheme } from '@/hooks/use-theme';
const colorPalettes = [
  { name: 'Zenvoyer Blue', color: '221.2 83.2% 53.3%' },
  { name: 'Emerald', color: '142.1 76.2% 36.3%' },
  { name: 'Crimson', color: '0 72.2% 50.6%' },
  { name: 'Violet', color: '262.1 83.3% 57.8%' },
  { name: 'Amber', color: '38 92.1% 50.2%' },
];
type Theme = 'light' | 'dark' | 'system';
export function ThemeSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const { theme, setTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState(settings?.theme.primaryColor || colorPalettes[0].color);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme);
  useEffect(() => {
    if (settings) {
      const dbColor = settings.theme.primaryColor;
      setSelectedColor(dbColor);
      document.documentElement.style.setProperty('--primary-hsl', dbColor);
    }
    setSelectedTheme(theme);
  }, [settings, theme]);
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    document.documentElement.style.setProperty('--primary-hsl', color);
  };
  const handleSaveChanges = async () => {
    setTheme(selectedTheme);
    await updateSettings({ theme: { primaryColor: selectedColor, colorScheme: selectedTheme } });
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
          <CardDescription>Personalize the look and feel of your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Color Scheme</h3>
            <RadioGroup
              defaultValue={selectedTheme}
              onValueChange={(value: Theme) => setSelectedTheme(value)}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Sun className="mb-3 h-6 w-6" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Moon className="mb-3 h-6 w-6" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Laptop className="mb-3 h-6 w-6" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Primary Color
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {colorPalettes.map((palette) => (
                <button
                  key={palette.name}
                  onClick={() => handleColorChange(palette.color)}
                  className={cn(
                    'h-20 w-full rounded-lg border-2 flex items-center justify-center transition-all',
                    selectedColor === palette.color ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                  )}
                  style={{ backgroundColor: `hsl(${palette.color})` }}
                >
                  {selectedColor === palette.color && <Check className="h-8 w-8 text-white" />}
                  <span className="sr-only">{palette.name}</span>
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