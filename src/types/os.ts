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

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<AppProps>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface AppProps {
  windowId: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}
