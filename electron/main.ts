import { app, BrowserWindow, ipcMain } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Add timing measurements
const startTime = Date.now();
console.log('🚀 Main process started at:', new Date().toISOString());

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  console.log('⏱️ Creating window at:', Date.now() - startTime, 'ms');

  // Use absolute path for icon to ensure it works in both dev and production
  const iconPath = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, 'public', 'logo.png')
    : path.join(RENDERER_DIST, 'logo.png');

  console.log('🖼️ Icon path:', iconPath);
  console.log('🖼️ Icon exists:', fs.existsSync(iconPath));

  const windowCreationStart = Date.now();

  win = new BrowserWindow({
    icon: iconPath,
    title: 'Crm System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    autoHideMenuBar: true,
  });

  console.log('⏱️ Window created in:', Date.now() - windowCreationStart, 'ms');

  // Add event listeners for timing
  win.webContents.on('did-finish-load', () => {
    console.log('⏱️ Renderer finished loading at:', Date.now() - startTime, 'ms');
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  win.webContents.on('dom-ready', () => {
    console.log('⏱️ DOM ready at:', Date.now() - startTime, 'ms');
  });

  win.webContents.on('did-start-loading', () => {
    console.log('⏱️ Started loading page at:', Date.now() - startTime, 'ms');
  });

  win.webContents.on('did-stop-loading', () => {
    console.log('⏱️ Stopped loading page at:', Date.now() - startTime, 'ms');
  });

  const maximizeStart = Date.now();
  win.maximize();
  console.log('⏱️ Window maximized in:', Date.now() - maximizeStart, 'ms');

  const showStart = Date.now();
  win.show();
  console.log('⏱️ Window shown in:', Date.now() - showStart, 'ms');

  const loadStart = Date.now();
  if (VITE_DEV_SERVER_URL) {
    console.log('🔄 Loading dev server URL:', VITE_DEV_SERVER_URL);
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const htmlPath = path.join(RENDERER_DIST, 'index.html');
    console.log('🔄 Loading HTML file:', htmlPath);
    console.log('📁 HTML file exists:', fs.existsSync(htmlPath));
    win.loadFile(htmlPath);
  }
  console.log('⏱️ Load initiated in:', Date.now() - loadStart, 'ms');
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('⏱️ Setting up app.whenReady at:', Date.now() - startTime, 'ms');
app.whenReady().then(() => {
  console.log('⏱️ App ready at:', Date.now() - startTime, 'ms');
  createWindow();
});

// Config management
// Test flag to disable config loading and use default values only
// Set to true to:
// - Skip loading config.json file
// - Always use default configuration values
// - Disable config updates via IPC
// Useful for testing and development scenarios
const USE_DEFAULT_CONFIG_ONLY = false;

interface AppConfig {
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
    name: "John's Supplies Ltd.",
    point: 'Point #1',
  },
};

const getConfigPath = (): string => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
};

const saveConfig = (config: AppConfig): void => {
  const saveStart = Date.now();
  try {
    const configPath = getConfigPath();
    const configDir = path.dirname(configPath);
    console.log('Saving config to:', configPath);

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('Config saved in:', Date.now() - saveStart, 'ms');
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
};

const loadConfig = (): AppConfig => {
  const loadStart = Date.now();
  console.log('loadConfig called at:', Date.now() - startTime, 'ms');

  // Check if we should use default config only (for testing)
  if (USE_DEFAULT_CONFIG_ONLY) {
    console.log('TEST MODE: Using default config only (config file loading disabled)');
    console.log('Config loaded (test mode) in:', Date.now() - loadStart, 'ms');
    return defaultConfig;
  }

  try {
    const configPath = getConfigPath();
    console.log('Loading config from:', configPath);

    if (fs.existsSync(configPath)) {
      console.log('Config file exists, reading...');
      const configData = fs.readFileSync(configPath, 'utf-8');
      console.log('Raw config data:', configData);

      const loadedConfig = JSON.parse(configData);
      console.log('Parsed config:', JSON.stringify(loadedConfig, null, 2));

      // Merge with default config to ensure all properties exist
      const finalConfig = {
        ...defaultConfig,
        ...loadedConfig,
        user: { ...defaultConfig.user, ...loadedConfig.user },
        business: { ...defaultConfig.business, ...loadedConfig.business },
      };

      console.log('Final merged config:', JSON.stringify(finalConfig, null, 2));
      return finalConfig;
    } else {
      // Create config file with default values if it doesn't exist
      console.log('Config file not found, creating with default values...');
      saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error);
  }
  return defaultConfig;
};

console.log('Loading initial config...');
let currentConfig = loadConfig();
console.log('Initial config loaded');

// IPC handlers
ipcMain.handle('get-config', () => {
  const ipcStart = Date.now();
  console.log('IPC: get-config called at:', Date.now() - startTime, 'ms');
  console.log('IPC: returning config in:', Date.now() - ipcStart, 'ms');
  return currentConfig;
});

ipcMain.handle('update-config', (_, newConfig: Partial<AppConfig>) => {
  const ipcStart = Date.now();
  console.log('IPC: update-config called with:', JSON.stringify(newConfig, null, 2));
  // Check if we're in test mode
  if (USE_DEFAULT_CONFIG_ONLY) {
    console.log('TEST MODE: Config updates disabled, returning current config');
    console.log('IPC: update-config (test mode) completed in:', Date.now() - ipcStart, 'ms');
    return currentConfig;
  }

  const updatedConfig = {
    ...currentConfig,
    ...newConfig,
    user: { ...currentConfig.user, ...newConfig.user },
    business: { ...currentConfig.business, ...newConfig.business },
  };

  console.log('Saving updated config:', JSON.stringify(updatedConfig, null, 2));
  saveConfig(updatedConfig);
  currentConfig = updatedConfig;
  console.log('IPC: update-config completed in:', Date.now() - ipcStart, 'ms');
  return updatedConfig;
});

ipcMain.handle('get-config-path', () => {
  return getConfigPath();
});

console.log('Main process setup completed at:', Date.now() - startTime, 'ms');
