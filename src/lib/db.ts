import Dexie, { Table } from 'dexie';

export interface FileItem {
  id?: number;
  name: string;
  type: 'file' | 'folder';
  parentId: number | null;
  content?: string | ArrayBuffer;
  mimeType?: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  isFavorite: boolean;
}

export interface NoteItem {
  id?: number;
  title: string;
  content: string;
  notebookId: number | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface NotebookItem {
  id?: number;
  name: string;
  parentId: number | null;
  color: string;
  createdAt: Date;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color: string;
  calendarId: number;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminder?: number; // minutes before
  createdAt: Date;
}

export interface CalendarItem {
  id?: number;
  name: string;
  color: string;
  isVisible: boolean;
}

export interface BookmarkItem {
  id?: number;
  title: string;
  url: string;
  folderId: number | null;
  createdAt: Date;
}

export interface BrowsingHistoryItem {
  id?: number;
  title: string;
  url: string;
  visitedAt: Date;
}

export interface PlaylistItem {
  id?: number;
  name: string;
  createdAt: Date;
}

export interface MediaItem {
  id?: number;
  name: string;
  type: 'audio' | 'video';
  fileId: number;
  duration?: number;
  artist?: string;
  album?: string;
  artworkData?: ArrayBuffer;
  playlistId?: number;
  createdAt: Date;
}

export interface SettingsItem {
  key: string;
  value: any;
}

class WebOSDatabase extends Dexie {
  files!: Table<FileItem>;
  notes!: Table<NoteItem>;
  notebooks!: Table<NotebookItem>;
  events!: Table<CalendarEvent>;
  calendars!: Table<CalendarItem>;
  bookmarks!: Table<BookmarkItem>;
  history!: Table<BrowsingHistoryItem>;
  playlists!: Table<PlaylistItem>;
  media!: Table<MediaItem>;
  settings!: Table<SettingsItem>;

  constructor() {
    super('WebOSDatabase');
    
    this.version(1).stores({
      files: '++id, name, type, parentId, isDeleted, isFavorite, createdAt, modifiedAt',
      notes: '++id, title, notebookId, isPinned, isArchived, createdAt, modifiedAt, *tags',
      notebooks: '++id, name, parentId',
      events: '++id, title, startDate, endDate, calendarId',
      calendars: '++id, name',
      bookmarks: '++id, title, url, folderId',
      history: '++id, url, visitedAt',
      playlists: '++id, name',
      media: '++id, name, type, fileId, playlistId',
      settings: 'key'
    });
  }
}

export const db = new WebOSDatabase();

// Initialize default data
export async function initializeDatabase() {
  const filesCount = await db.files.count();
  
  if (filesCount === 0) {
    // Create default folders
    const desktopId = await db.files.add({
      name: 'Desktop',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: true
    });

    const documentsId = await db.files.add({
      name: 'Documents',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: true
    });

    const downloadsId = await db.files.add({
      name: 'Downloads',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: true
    });

    const picturesId = await db.files.add({
      name: 'Pictures',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: true
    });

    const musicId = await db.files.add({
      name: 'Music',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: true
    });

    const videosId = await db.files.add({
      name: 'Videos',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: true
    });

    // Create welcome file
    await db.files.add({
      name: 'Welcome.txt',
      type: 'file',
      parentId: documentsId,
      content: `Welcome to WebOS!
      
This is a fully functional browser-based operating system.

Features:
- Complete file management with drag & drop
- Multiple built-in applications
- Persistent storage using IndexedDB
- Window management with minimize, maximize, close
- Start menu and taskbar

Enjoy exploring WebOS!`,
      mimeType: 'text/plain',
      size: 300,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: false
    });

    // Create sample code file
    await db.files.add({
      name: 'hello.js',
      type: 'file',
      parentId: documentsId,
      content: `// Welcome to WebOS Code Editor!

function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to WebOS, \${name}!\`;
}

// Try editing this code
const message = greet('User');
console.log(message);

// Features:
// - Syntax highlighting
// - Multiple tabs
// - Auto-save
// - Find and replace
`,
      mimeType: 'text/javascript',
      size: 350,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: false
    });
  }

  // Initialize default calendars
  const calendarsCount = await db.calendars.count();
  if (calendarsCount === 0) {
    await db.calendars.bulkAdd([
      { name: 'Personal', color: '#3b82f6', isVisible: true },
      { name: 'Work', color: '#ef4444', isVisible: true },
      { name: 'Holidays', color: '#10b981', isVisible: true }
    ]);
  }

  // Initialize default settings
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.bulkAdd([
      { key: 'wallpaper', value: 'cosmic' },
      { key: 'theme', value: 'dark' },
      { key: 'accentColor', value: '#3b82f6' },
      { key: 'username', value: 'User' },
      { key: 'iconSize', value: 'medium' },
      { key: 'fontSize', value: 'normal' },
      { key: 'animationsEnabled', value: true },
      { key: 'transparency', value: true },
      { key: 'nightLight', value: false },
      { key: 'autoLock', value: 0 },
      { key: 'startupApps', value: [] },
      { key: 'defaultApps', value: {} }
    ]);
  }
}

// File System Operations
export const fileOperations = {
  async getChildren(parentId: number | null, includeDeleted = false): Promise<FileItem[]> {
    let query = db.files.where('parentId').equals(parentId ?? 0);
    const files = await db.files.filter(f => 
      f.parentId === parentId && (includeDeleted || !f.isDeleted)
    ).toArray();
    return files.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  },

  async getFile(id: number): Promise<FileItem | undefined> {
    return db.files.get(id);
  },

  async createFile(name: string, parentId: number | null, content: string = '', mimeType = 'text/plain'): Promise<number> {
    return db.files.add({
      name,
      type: 'file',
      parentId,
      content,
      mimeType,
      size: content.length,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: false
    });
  },

  async createFolder(name: string, parentId: number | null): Promise<number> {
    return db.files.add({
      name,
      type: 'folder',
      parentId,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false,
      isFavorite: false
    });
  },

  async updateFile(id: number, updates: Partial<FileItem>): Promise<void> {
    await db.files.update(id, { ...updates, modifiedAt: new Date() });
  },

  async deleteFile(id: number, permanent = false): Promise<void> {
    if (permanent) {
      // Recursively delete children
      const children = await this.getChildren(id, true);
      for (const child of children) {
        await this.deleteFile(child.id!, true);
      }
      await db.files.delete(id);
    } else {
      // Move to trash
      await db.files.update(id, { isDeleted: true, deletedAt: new Date() });
    }
  },

  async restoreFile(id: number): Promise<void> {
    await db.files.update(id, { isDeleted: false, deletedAt: undefined });
  },

  async emptyTrash(): Promise<void> {
    const trashedFiles = await db.files.filter(f => f.isDeleted).toArray();
    for (const file of trashedFiles) {
      await this.deleteFile(file.id!, true);
    }
  },

  async getTrash(): Promise<FileItem[]> {
    return db.files.filter(f => f.isDeleted).toArray();
  },

  async copyFile(id: number, newParentId: number | null, newName?: string): Promise<number> {
    const file = await this.getFile(id);
    if (!file) throw new Error('File not found');

    const name = newName || `${file.name} (Copy)`;
    
    if (file.type === 'folder') {
      const newFolderId = await this.createFolder(name, newParentId);
      const children = await this.getChildren(id);
      for (const child of children) {
        await this.copyFile(child.id!, newFolderId);
      }
      return newFolderId;
    } else {
      return db.files.add({
        ...file,
        id: undefined,
        name,
        parentId: newParentId,
        createdAt: new Date(),
        modifiedAt: new Date()
      });
    }
  },

  async moveFile(id: number, newParentId: number | null): Promise<void> {
    await db.files.update(id, { parentId: newParentId, modifiedAt: new Date() });
  },

  async searchFiles(query: string, parentId?: number | null): Promise<FileItem[]> {
    const lowerQuery = query.toLowerCase();
    return db.files.filter(f => 
      !f.isDeleted && 
      f.name.toLowerCase().includes(lowerQuery) &&
      (parentId === undefined || f.parentId === parentId)
    ).toArray();
  },

  async getFavorites(): Promise<FileItem[]> {
    return db.files.filter(f => f.isFavorite && !f.isDeleted).toArray();
  },

  async toggleFavorite(id: number): Promise<void> {
    const file = await this.getFile(id);
    if (file) {
      await db.files.update(id, { isFavorite: !file.isFavorite });
    }
  },

  async getStorageStats(): Promise<{ used: number; fileCount: number; folderCount: number }> {
    const files = await db.files.filter(f => !f.isDeleted).toArray();
    const fileCount = files.filter(f => f.type === 'file').length;
    const folderCount = files.filter(f => f.type === 'folder').length;
    const used = files.reduce((acc, f) => acc + (f.size || 0), 0);
    return { used, fileCount, folderCount };
  },

  async getPath(id: number): Promise<FileItem[]> {
    const path: FileItem[] = [];
    let current = await this.getFile(id);
    
    while (current) {
      path.unshift(current);
      if (current.parentId === null) break;
      current = await this.getFile(current.parentId);
    }
    
    return path;
  },

  async getRootFolders(): Promise<FileItem[]> {
    return db.files.filter(f => f.parentId === null && !f.isDeleted && f.type === 'folder').toArray();
  }
};

// Note Operations
export const noteOperations = {
  async getAllNotes(): Promise<NoteItem[]> {
    return db.notes.orderBy('modifiedAt').reverse().toArray();
  },

  async getNote(id: number): Promise<NoteItem | undefined> {
    return db.notes.get(id);
  },

  async createNote(notebookId: number | null = null): Promise<number> {
    return db.notes.add({
      title: 'Untitled Note',
      content: '',
      notebookId,
      tags: [],
      isPinned: false,
      isArchived: false,
      createdAt: new Date(),
      modifiedAt: new Date()
    });
  },

  async updateNote(id: number, updates: Partial<NoteItem>): Promise<void> {
    await db.notes.update(id, { ...updates, modifiedAt: new Date() });
  },

  async deleteNote(id: number): Promise<void> {
    await db.notes.delete(id);
  },

  async searchNotes(query: string): Promise<NoteItem[]> {
    const lowerQuery = query.toLowerCase();
    return db.notes.filter(n => 
      !n.isArchived &&
      (n.title.toLowerCase().includes(lowerQuery) || 
       n.content.toLowerCase().includes(lowerQuery))
    ).toArray();
  }
};

// Calendar Operations
export const calendarOperations = {
  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    return db.events.filter(e => 
      new Date(e.startDate) >= start && new Date(e.startDate) <= end
    ).toArray();
  },

  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<number> {
    return db.events.add({
      ...event,
      createdAt: new Date()
    });
  },

  async updateEvent(id: number, updates: Partial<CalendarEvent>): Promise<void> {
    await db.events.update(id, updates);
  },

  async deleteEvent(id: number): Promise<void> {
    await db.events.delete(id);
  },

  async getCalendars(): Promise<CalendarItem[]> {
    return db.calendars.toArray();
  }
};

// Settings Operations
export const settingsOperations = {
  async get(key: string): Promise<any> {
    const setting = await db.settings.get(key);
    return setting?.value;
  },

  async set(key: string, value: any): Promise<void> {
    await db.settings.put({ key, value });
  },

  async getAll(): Promise<Record<string, any>> {
    const settings = await db.settings.toArray();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }
};
