import { create } from 'zustand';
import type { PlatformSettings } from '@/types';
import { getPlatformSettings, updatePlatformSettings as apiUpdatePlatformSettings } from '@/lib/api-client';
interface PlatformSettingsState {
  settings: PlatformSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
}
export const usePlatformSettingsStore = create<PlatformSettingsState>((set, get) => ({
  settings: null,
  isLoading: true,
  error: null,
  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const settings = await getPlatformSettings();
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
      const returnedSettings = await apiUpdatePlatformSettings(newSettings);
      set({ settings: returnedSettings });
    } catch (error) {
      // Revert on error
      set({ settings: currentSettings, error: (error as Error).message });
      throw error;
    }
  },
}));
// Initial fetch for super admin
usePlatformSettingsStore.getState().fetchSettings();