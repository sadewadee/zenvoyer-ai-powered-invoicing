import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/use-settings-store';
import { useSubscription } from './use-subscription';
type Theme = 'dark' | 'light' | 'system';
export function useTheme() {
  const { isPro } = useSubscription();
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  // Pro users get theme from DB, Free users from localStorage
  const getStoredTheme = (): Theme => {
    if (isPro && settings?.theme.colorScheme) {
      return settings.theme.colorScheme as Theme;
    }
    return (localStorage.getItem('theme') as Theme) || 'system';
  };
  const theme = getStoredTheme();
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);
  const setTheme = (newTheme: Theme) => {
    if (isPro) {
      updateSettings({ theme: { ...settings!.theme, colorScheme: newTheme } });
    } else {
      localStorage.setItem('theme', newTheme);
      // Force a re-render for non-pro users as localStorage doesn't trigger it
      window.dispatchEvent(new Event('storage'));
    }
  };
  return {
    theme,
    setTheme,
  };
}