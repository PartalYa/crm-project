import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface AppConfig {
  user: {
    name: string;
    initials: string;
  };
  business: {
    name: string;
    point: string;
  };
}

const defaultConfig: AppConfig = {
  user: {
    name: 'John Doe',
    initials: 'JD',
  },
  business: {
    name: "John's Supplies",
    point: 'Point #1',
  },
};

let configPath: string;
let config: AppConfig;

// Initialize config path based on environment
const initConfigPath = () => {
  if (typeof window !== 'undefined' && window.require) {
    // Running in Electron renderer process
    const { ipcRenderer } = window.require('electron');
    configPath = ipcRenderer.sendSync('get-config-path');
  } else if (typeof process !== 'undefined' && process.versions?.electron) {
    // Running in Electron main process
    const userDataPath = app.getPath('userData');
    configPath = path.join(userDataPath, 'config.json');
  } else {
    // Development mode or fallback
    configPath = path.join(__dirname, '../../config.json');
  }
};

// Load configuration from file
const loadConfig = (): AppConfig => {
  try {
    initConfigPath();

    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      const loadedConfig = JSON.parse(configData);

      // Merge with default config to ensure all properties exist
      return {
        ...defaultConfig,
        ...loadedConfig,
        user: { ...defaultConfig.user, ...loadedConfig.user },
        business: { ...defaultConfig.business, ...loadedConfig.business },
      };
    }
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error);
  }

  return defaultConfig;
};

// Save configuration to file
const saveConfig = (newConfig: AppConfig): void => {
  try {
    initConfigPath();

    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');
    config = newConfig;
  } catch (error) {
    console.error('Failed to save config:', error);
  }
};

// Initialize config on module load
config = loadConfig();

// Export functions for use in renderer process
export const getConfig = (): AppConfig => config;

export const updateConfig = (newConfig: Partial<AppConfig>): void => {
  const updatedConfig = {
    ...config,
    ...newConfig,
    user: { ...config.user, ...newConfig.user },
    business: { ...config.business, ...newConfig.business },
  };
  saveConfig(updatedConfig);
};

export const resetConfig = (): void => {
  saveConfig(defaultConfig);
};

// For renderer process, provide async versions that use IPC
export const getConfigAsync = async (): Promise<AppConfig> => {
  if (typeof window !== 'undefined' && window.require) {
    const { ipcRenderer } = window.require('electron');
    return await ipcRenderer.invoke('get-config');
  }
  return getConfig();
};

export const updateConfigAsync = async (newConfig: Partial<AppConfig>): Promise<void> => {
  if (typeof window !== 'undefined' && window.require) {
    const { ipcRenderer } = window.require('electron');
    return await ipcRenderer.invoke('update-config', newConfig);
  }
  updateConfig(newConfig);
};
