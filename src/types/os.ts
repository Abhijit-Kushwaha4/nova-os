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
}

export interface DesktopIcon {
  id: string;
  appId: string;
  name: string;
  icon: string;
  x: number;
  y: number;
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<AppProps>;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface AppProps {
  windowId: string;
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  createdAt: Date;
  modifiedAt: Date;
  size?: number;
  mimeType?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface UserSettings {
  wallpaper: string;
  theme: 'dark' | 'light';
  accentColor: string;
  username: string;
  iconSize: 'small' | 'medium' | 'large';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}
