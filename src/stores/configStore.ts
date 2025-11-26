import { create } from 'zustand';
import { AppConfig } from '../hooks/useAppConfig';

interface ConfigStore {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  setConfig: (config: AppConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeConfig: () => Promise<void>;
}

// Default config for fallback
const defaultConfig: AppConfig = {
  user: {
    id: 'user_001',
    name: 'John Doe',
    initials: 'JD',
  },
  business: {
    name: "John's Supplies",
    point: 'Point #1',
  },
  defaultSettings: {
    warehouse: {
      id: 'warehouse_main',
      name: 'Main Warehouse',
    },
    deliveryWarehouse: {
      id: 'warehouse_delivery',
      name: 'Delivery Warehouse',
    },
    company: {
      id: 'company_main',
      name: "John's Supplies Ltd.",
    },
    urgencyType: 'normal',
  },
};

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && window.ipcRenderer;

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: null,
  loading: true,
  error: null,

  setConfig: (config) => set({ config }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initializeConfig: async () => {
    const { setConfig, setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 ConfigStore: Loading config...');
      if (isElectron) {
        console.log('🖥️ Electron environment detected, calling IPC...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadedConfig = await (window.ipcRenderer as any).getConfig();
        console.log('📋 ConfigStore: Received config:', loadedConfig);
        setConfig(loadedConfig);
      } else {
        console.log('🌐 Web environment detected, using default config');
        setConfig(defaultConfig);
      }
    } catch (err) {
      console.error('❌ ConfigStore: Error loading config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load config');
      setConfig(defaultConfig);
    } finally {
      console.log('⏱️ ConfigStore: Config loading completed');
      setLoading(false);
    }
  },
}));

// Helper function to get config with initialization if needed
export const getConfig = async (): Promise<AppConfig> => {
  const store = useConfigStore.getState();

  if (!store.config && !store.loading) {
    await store.initializeConfig();
  }

  // Wait for loading to complete if it's in progress
  if (store.loading) {
    return new Promise((resolve) => {
      const unsubscribe = useConfigStore.subscribe((state) => {
        if (!state.loading && state.config) {
          unsubscribe();
          resolve(state.config);
        }
      });
    });
  }

  return store.config || defaultConfig;
};
