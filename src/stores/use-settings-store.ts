import { create } from 'zustand';
import type { Settings } from '@/types';
import { getSettings, updateSettings as apiUpdateSettings } from '@/lib/api-client';
interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: true,
  error: null,
  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const settings = await getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  updateSettings: async (newSettings) => {
    const currentSettings = get().settings;
    if (!currentSettings) return;
    // Optimistic update
    const updatedSettings = { ...currentSettings, ...newSettings };
    set({ settings: updatedSettings });
    try {
      const returnedSettings = await apiUpdateSettings(newSettings);
      set({ settings: returnedSettings });
    } catch (error) {
      // Revert on error
      set({ settings: currentSettings, error: (error as Error).message });
    }
  },
}));
// Initial fetch
useSettingsStore.getState().fetchSettings();