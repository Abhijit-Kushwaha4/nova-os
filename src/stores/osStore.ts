import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isClosing?: boolean;
  props?: Record<string, any>;
}

export interface DesktopIcon {
  id: string;
  appId: string;
  name: string;
  icon: string;
  x: number;
  y: number;
}

export interface ClipboardItem {
  type: 'cut' | 'copy';
  fileIds: number[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  appId?: string;
}

interface OSState {
  // Windows
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  
  // Desktop
  desktopIcons: DesktopIcon[];
  selectedIconIds: string[];
  
  // Clipboard
  clipboard: ClipboardItem | null;
  
  // Notifications
  notifications: Notification[];
  
  // UI State
  isStartMenuOpen: boolean;
  isBooting: boolean;
  contextMenu: { x: number; y: number; type: string; data?: any } | null;
  
  // Settings
  settings: {
    wallpaper: string;
    theme: 'dark' | 'light';
    accentColor: string;
    username: string;
    iconSize: 'small' | 'medium' | 'large';
    animationsEnabled: boolean;
    transparency: boolean;
  };
  
  // Performance tracking
  startTime: number;
  
  // Window Actions
  openWindow: (appId: string, title: string, icon: string, width?: number, height?: number, props?: Record<string, any>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  updateWindowTitle: (id: string, title: string) => void;
  
  // Desktop Actions
  selectIcon: (id: string, isMultiSelect?: boolean) => void;
  clearSelection: () => void;
  updateIconPosition: (id: string, x: number, y: number) => void;
  
  // Clipboard
  setClipboard: (item: ClipboardItem | null) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Settings
  updateSettings: (settings: Partial<OSState['settings']>) => void;
  
  // UI Actions
  setStartMenuOpen: (open: boolean) => void;
  setContextMenu: (menu: OSState['contextMenu']) => void;
  finishBooting: () => void;
  
  // Getters
  getUptime: () => number;
  getRunningApps: () => { appId: string; count: number }[];
}

const defaultDesktopIcons: DesktopIcon[] = [
  { id: 'icon-1', appId: 'file-explorer', name: 'Files', icon: 'folder', x: 20, y: 20 },
  { id: 'icon-2', appId: 'terminal', name: 'Terminal', icon: 'terminal', x: 20, y: 120 },
  { id: 'icon-3', appId: 'text-editor', name: 'Code', icon: 'file-code', x: 20, y: 220 },
  { id: 'icon-4', appId: 'calculator', name: 'Calculator', icon: 'calculator', x: 20, y: 320 },
  { id: 'icon-5', appId: 'notes', name: 'Notes', icon: 'sticky-note', x: 20, y: 420 },
  { id: 'icon-6', appId: 'browser', name: 'Browser', icon: 'globe', x: 120, y: 20 },
  { id: 'icon-7', appId: 'calendar', name: 'Calendar', icon: 'calendar', x: 120, y: 120 },
  { id: 'icon-8', appId: 'settings', name: 'Settings', icon: 'settings', x: 120, y: 220 },
  { id: 'icon-9', appId: 'media-player', name: 'Media', icon: 'music', x: 120, y: 320 },
  { id: 'icon-10', appId: 'paint', name: 'Paint', icon: 'palette', x: 120, y: 420 },
  { id: 'icon-11', appId: 'weather', name: 'Weather', icon: 'cloud-sun', x: 220, y: 20 },
  { id: 'icon-12', appId: 'task-manager', name: 'Task Manager', icon: 'activity', x: 220, y: 120 },
];

const defaultSettings = {
  wallpaper: 'cosmic',
  theme: 'dark' as const,
  accentColor: '#3b82f6',
  username: 'User',
  iconSize: 'medium' as const,
  animationsEnabled: true,
  transparency: true,
};

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      windows: [],
      activeWindowId: null,
      nextZIndex: 1,
      desktopIcons: defaultDesktopIcons,
      selectedIconIds: [],
      clipboard: null,
      notifications: [],
      isStartMenuOpen: false,
      isBooting: true,
      contextMenu: null,
      settings: defaultSettings,
      startTime: Date.now(),

      openWindow: (appId, title, icon, width = 900, height = 600, props = {}) => {
        const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const offset = get().windows.length * 30;
        const centerX = Math.max(50, (window.innerWidth - width) / 2 + offset);
        const centerY = Math.max(50, (window.innerHeight - height) / 2 + offset);

        set((state) => ({
          windows: [...state.windows, {
            id,
            appId,
            title,
            icon,
            x: Math.min(centerX, window.innerWidth - 200),
            y: Math.min(centerY, window.innerHeight - 200),
            width,
            height,
            isMinimized: false,
            isMaximized: false,
            zIndex: state.nextZIndex,
            props,
          }],
          activeWindowId: id,
          nextZIndex: state.nextZIndex + 1,
          isStartMenuOpen: false,
        }));
        
        return id;
      },

      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w => 
            w.id === id ? { ...w, isClosing: true } : w
          ),
        }));
        
        setTimeout(() => {
          set((state) => ({
            windows: state.windows.filter(w => w.id !== id),
            activeWindowId: state.activeWindowId === id 
              ? state.windows.filter(w => w.id !== id && !w.isMinimized)[0]?.id || null 
              : state.activeWindowId,
          }));
        }, 200);
      },

      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, isMinimized: true } : w
          ),
          activeWindowId: state.activeWindowId === id 
            ? state.windows.filter(w => w.id !== id && !w.isMinimized)[0]?.id || null 
            : state.activeWindowId,
        }));
      },

      maximizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, isMaximized: true } : w
          ),
        }));
      },

      restoreWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, isMinimized: false, isMaximized: false, zIndex: state.nextZIndex } : w
          ),
          activeWindowId: id,
          nextZIndex: state.nextZIndex + 1,
        }));
      },

      focusWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, zIndex: state.nextZIndex, isMinimized: false } : w
          ),
          activeWindowId: id,
          nextZIndex: state.nextZIndex + 1,
        }));
      },

      updateWindowPosition: (id, x, y) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, x, y } : w
          ),
        }));
      },

      updateWindowSize: (id, width, height) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, width, height } : w
          ),
        }));
      },

      updateWindowTitle: (id, title) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, title } : w
          ),
        }));
      },

      selectIcon: (id, isMultiSelect = false) => {
        set((state) => ({
          selectedIconIds: isMultiSelect
            ? state.selectedIconIds.includes(id)
              ? state.selectedIconIds.filter(i => i !== id)
              : [...state.selectedIconIds, id]
            : [id],
        }));
      },

      clearSelection: () => {
        set({ selectedIconIds: [] });
      },

      updateIconPosition: (id, x, y) => {
        set((state) => ({
          desktopIcons: state.desktopIcons.map(icon =>
            icon.id === id ? { ...icon, x, y } : icon
          ),
        }));
      },

      setClipboard: (item) => {
        set({ clipboard: item });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
        }));
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          get().dismissNotification(newNotification.id);
        }, 5000);
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        
        if (newSettings.theme) {
          document.documentElement.classList.toggle('light', newSettings.theme === 'light');
        }
      },

      setStartMenuOpen: (open) => {
        set({ isStartMenuOpen: open, contextMenu: null });
      },

      setContextMenu: (menu) => {
        set({ contextMenu: menu, isStartMenuOpen: false });
      },

      finishBooting: () => {
        set({ isBooting: false, startTime: Date.now() });
      },

      getUptime: () => {
        return Math.floor((Date.now() - get().startTime) / 1000);
      },

      getRunningApps: () => {
        const apps: Record<string, number> = {};
        get().windows.forEach(w => {
          apps[w.appId] = (apps[w.appId] || 0) + 1;
        });
        return Object.entries(apps).map(([appId, count]) => ({ appId, count }));
      },
    }),
    {
      name: 'webos-state',
      partialize: (state) => ({
        desktopIcons: state.desktopIcons,
        settings: state.settings,
      }),
    }
  )
);
