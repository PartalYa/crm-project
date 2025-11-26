import { useState, useEffect } from 'react';
import { updateLoadingText, LoadingStates } from '../utils/loadingScreen';

export interface AppConfig {
  user: {
    id: string;
    name: string;
    initials: string;
  };
  business: {
    name: string;
    point: string;
  };
  defaultSettings: {
    warehouse: {
      id: string;
      name: string;
    };
    deliveryWarehouse: {
      id: string;
      name: string;
    };
    company: {
      id: string;
      name: string;
    };
    urgencyType: string;
  };
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

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hookStartTime = Date.now();

  console.log('🎣 useAppConfig hook initialized at:', hookStartTime);

  const loadConfig = async () => {
    const loadStart = Date.now();
    console.log('🔄 loadConfig function started');

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Frontend: Loading config...');
      updateLoadingText(LoadingStates.LOADING_CONFIG);

      if (isElectron) {
        console.log('�️ Electron environment detected, calling IPC...');
        const ipcStart = Date.now();

        const loadedConfig = await (window.ipcRenderer as any).getConfig();

        console.log('� IPC getConfig completed in:', Date.now() - ipcStart, 'ms');
        console.log('📋 Received config:', loadedConfig);
        setConfig(loadedConfig);
      } else {
        console.log('🌐 Web environment detected, using default config');
        setConfig(defaultConfig);
      }
    } catch (err) {
      console.error('❌ Error loading config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load config');
      setConfig(defaultConfig);
    } finally {
      console.log('⏱️ Config loading completed in:', Date.now() - loadStart, 'ms');
      setLoading(false);
    }
  };
  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      setError(null);
      console.log('🔄 Frontend: Updating config with:', JSON.stringify(newConfig, null, 2));

      if (isElectron) {
        const updatedConfig = await (window.ipcRenderer as any).updateConfig(newConfig);
        console.log(
          '🔄 Frontend: Config updated, received:',
          JSON.stringify(updatedConfig, null, 2),
        );
        setConfig(updatedConfig);
      } else {
        // In development mode, just update local state
        const updatedConfig = {
          ...config,
          ...newConfig,
          user: { ...config.user, ...newConfig.user },
          business: { ...config.business, ...newConfig.business },
        };
        setConfig(updatedConfig);
      }
    } catch (err) {
      console.error('Failed to update config:', err);
      setError(err instanceof Error ? err.message : 'Failed to update config');
      throw err;
    }
  };
  useEffect(() => {
    const effectStart = Date.now();
    console.log(
      '⚡ useAppConfig effect started at:',
      effectStart - hookStartTime,
      'ms after hook init',
    );

    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    reloadConfig: loadConfig,
  };
};
