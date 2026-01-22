import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WindowState, DesktopIcon, FileSystemItem, Note, UserSettings, Notification } from '@/types/os';

interface OSState {
  // Windows
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  
  // Desktop
  desktopIcons: DesktopIcon[];
  selectedIconIds: string[];
  
  // File System
  fileSystem: FileSystemItem[];
  
  // Notes
  notes: Note[];
  
  // Settings
  settings: UserSettings;
  
  // Notifications
  notifications: Notification[];
  
  // UI State
  isStartMenuOpen: boolean;
  isBooting: boolean;
  contextMenu: { x: number; y: number; type: 'desktop' | 'icon' | 'file'; targetId?: string } | null;
  
  // Window Actions
  openWindow: (appId: string, title: string, icon: string, width?: number, height?: number) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  
  // Desktop Actions
  selectIcon: (id: string, isMultiSelect?: boolean) => void;
  clearSelection: () => void;
  updateIconPosition: (id: string, x: number, y: number) => void;
  
  // File System Actions
  createFile: (name: string, parentId: string | null, content?: string) => FileSystemItem;
  createFolder: (name: string, parentId: string | null) => FileSystemItem;
  deleteItem: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
  getChildren: (parentId: string | null) => FileSystemItem[];
  
  // Notes Actions
  createNote: () => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  
  // UI Actions
  setStartMenuOpen: (open: boolean) => void;
  setContextMenu: (menu: OSState['contextMenu']) => void;
  finishBooting: () => void;
}

const defaultDesktopIcons: DesktopIcon[] = [
  { id: 'icon-1', appId: 'file-explorer', name: 'Files', icon: 'folder', x: 20, y: 20 },
  { id: 'icon-2', appId: 'terminal', name: 'Terminal', icon: 'terminal', x: 20, y: 120 },
  { id: 'icon-3', appId: 'text-editor', name: 'Editor', icon: 'file-text', x: 20, y: 220 },
  { id: 'icon-4', appId: 'calculator', name: 'Calculator', icon: 'calculator', x: 20, y: 320 },
  { id: 'icon-5', appId: 'notes', name: 'Notes', icon: 'sticky-note', x: 20, y: 420 },
  { id: 'icon-6', appId: 'settings', name: 'Settings', icon: 'settings', x: 20, y: 520 },
];

const defaultFileSystem: FileSystemItem[] = [
  { id: 'root', name: 'Home', type: 'folder', parentId: null, createdAt: new Date(), modifiedAt: new Date() },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'root', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'root', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'root', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'welcome', name: 'Welcome.txt', type: 'file', parentId: 'documents', content: 'Welcome to WebOS!\n\nThis is your personal operating system running in the browser.\n\nExplore the apps, create files, and enjoy!', createdAt: new Date(), modifiedAt: new Date(), size: 120 },
];

const defaultSettings: UserSettings = {
  wallpaper: 'cosmic',
  theme: 'dark',
  accentColor: '#3b82f6',
  username: 'User',
  iconSize: 'medium',
};

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      windows: [],
      activeWindowId: null,
      nextZIndex: 1,
      desktopIcons: defaultDesktopIcons,
      selectedIconIds: [],
      fileSystem: defaultFileSystem,
      notes: [],
      settings: defaultSettings,
      notifications: [],
      isStartMenuOpen: false,
      isBooting: true,
      contextMenu: null,

      openWindow: (appId, title, icon, width = 800, height = 600) => {
        const state = get();
        const existingWindow = state.windows.find(w => w.appId === appId && !w.isMinimized);
        
        if (existingWindow) {
          get().focusWindow(existingWindow.id);
          return;
        }

        const minimizedWindow = state.windows.find(w => w.appId === appId && w.isMinimized);
        if (minimizedWindow) {
          get().restoreWindow(minimizedWindow.id);
          return;
        }

        const id = `window-${Date.now()}`;
        const centerX = Math.max(50, (window.innerWidth - width) / 2 + Math.random() * 50);
        const centerY = Math.max(50, (window.innerHeight - height) / 2 + Math.random() * 50);

        set((state) => ({
          windows: [...state.windows, {
            id,
            appId,
            title,
            icon,
            x: centerX,
            y: centerY,
            width,
            height,
            isMinimized: false,
            isMaximized: false,
            zIndex: state.nextZIndex,
          }],
          activeWindowId: id,
          nextZIndex: state.nextZIndex + 1,
          isStartMenuOpen: false,
        }));
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
              ? state.windows.filter(w => w.id !== id)[0]?.id || null 
              : state.activeWindowId,
          }));
        }, 200);
      },

      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, isMinimized: true } : w
          ),
          activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
        }));
      },

      maximizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, isMaximized: true, x: 0, y: 0 } : w
          ),
        }));
      },

      restoreWindow: (id) => {
        const state = get();
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
            w.id === id ? { ...w, zIndex: state.nextZIndex } : w
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

      createFile: (name, parentId, content = '') => {
        const newFile: FileSystemItem = {
          id: `file-${Date.now()}`,
          name,
          type: 'file',
          parentId,
          content,
          createdAt: new Date(),
          modifiedAt: new Date(),
          size: content.length,
        };
        set((state) => ({
          fileSystem: [...state.fileSystem, newFile],
        }));
        return newFile;
      },

      createFolder: (name, parentId) => {
        const newFolder: FileSystemItem = {
          id: `folder-${Date.now()}`,
          name,
          type: 'folder',
          parentId,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };
        set((state) => ({
          fileSystem: [...state.fileSystem, newFolder],
        }));
        return newFolder;
      },

      deleteItem: (id) => {
        const deleteRecursive = (itemId: string, items: FileSystemItem[]): FileSystemItem[] => {
          const children = items.filter(i => i.parentId === itemId);
          let result = items.filter(i => i.id !== itemId);
          children.forEach(child => {
            result = deleteRecursive(child.id, result);
          });
          return result;
        };

        set((state) => ({
          fileSystem: deleteRecursive(id, state.fileSystem),
        }));
      },

      renameItem: (id, newName) => {
        set((state) => ({
          fileSystem: state.fileSystem.map(item =>
            item.id === id ? { ...item, name: newName, modifiedAt: new Date() } : item
          ),
        }));
      },

      updateFileContent: (id, content) => {
        set((state) => ({
          fileSystem: state.fileSystem.map(item =>
            item.id === id ? { ...item, content, modifiedAt: new Date(), size: content.length } : item
          ),
        }));
      },

      getChildren: (parentId) => {
        return get().fileSystem.filter(item => item.parentId === parentId);
      },

      createNote: () => {
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: 'Untitled Note',
          content: '',
          isPinned: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
        return newNote;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === id ? { ...note, ...updates, modifiedAt: new Date() } : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter(note => note.id !== id),
        }));
      },

      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
          ),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        
        if (newSettings.theme) {
          document.documentElement.classList.toggle('light', newSettings.theme === 'light');
        }
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 20),
        }));
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      setStartMenuOpen: (open) => {
        set({ isStartMenuOpen: open, contextMenu: null });
      },

      setContextMenu: (menu) => {
        set({ contextMenu: menu, isStartMenuOpen: false });
      },

      finishBooting: () => {
        set({ isBooting: false });
      },
    }),
    {
      name: 'webos-storage',
      partialize: (state) => ({
        fileSystem: state.fileSystem,
        notes: state.notes,
        settings: state.settings,
        desktopIcons: state.desktopIcons,
      }),
    }
  )
);
