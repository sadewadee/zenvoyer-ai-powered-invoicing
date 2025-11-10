import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon } from 'lucide-react';
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };
  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}