import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Volume2, 
  Battery, 
  ChevronUp,
  Folder,
  Terminal,
  FileText,
  Calculator,
  StickyNote,
  Settings,
  Globe,
  Image
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { cn } from '@/lib/utils';

const appIcons: Record<string, React.ComponentType<any>> = {
  'file-explorer': Folder,
  'terminal': Terminal,
  'text-editor': FileText,
  'calculator': Calculator,
  'notes': StickyNote,
  'settings': Settings,
  'browser': Globe,
  'image-viewer': Image,
};

export const Taskbar: React.FC = () => {
  const { 
    windows, 
    activeWindowId, 
    isStartMenuOpen, 
    setStartMenuOpen,
    focusWindow,
    minimizeWindow,
    restoreWindow
  } = useOSStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTaskbarClick = (windowId: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(windowId);
    } else if (activeWindowId === windowId) {
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  return (
    <div className="os-taskbar fixed bottom-0 left-0 right-0 h-12 flex items-center justify-between px-2 z-50">
      {/* Start Button */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStartMenuOpen(!isStartMenuOpen)}
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
            isStartMenuOpen ? "bg-primary/20" : "hover:bg-secondary/50"
          )}
        >
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <div className="bg-primary rounded-sm" />
            <div className="bg-primary rounded-sm" />
            <div className="bg-primary rounded-sm" />
            <div className="bg-primary rounded-sm" />
          </div>
        </motion.button>
      </div>

      {/* Running Apps */}
      <div className="flex-1 flex items-center justify-center gap-1 px-4">
        {windows.map((win) => {
          const IconComponent = appIcons[win.appId] || Folder;
          const isActive = activeWindowId === win.id && !win.isMinimized;
          
          return (
            <motion.button
              key={win.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTaskbarClick(win.id, win.isMinimized)}
              className={cn(
                "relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors group",
                isActive ? "bg-primary/30" : "hover:bg-secondary/50",
                win.isMinimized && "opacity-60"
              )}
              title={win.title}
            >
              <IconComponent className="w-5 h-5 text-foreground" />
              
              {/* Active Indicator */}
              <div className={cn(
                "absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all",
                isActive ? "w-4 bg-primary" : win.isMinimized ? "w-1 bg-muted-foreground" : "w-0"
              )} />

              {/* Preview on Hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="os-glass px-3 py-1.5 rounded-lg whitespace-nowrap">
                  <span className="text-xs text-foreground">{win.title}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
          <Wifi className="w-4 h-4 text-foreground" />
          <Volume2 className="w-4 h-4 text-foreground" />
          <div className="flex items-center gap-1">
            <Battery className="w-4 h-4 text-foreground" />
            <span className="text-xs text-muted-foreground">{batteryLevel}%</span>
          </div>
        </div>

        <div className="flex flex-col items-end px-3 py-1 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
          <span className="text-xs text-foreground">{formatTime(currentTime)}</span>
          <span className="text-[10px] text-muted-foreground">{formatDate(currentTime)}</span>
        </div>
      </div>
    </div>
  );
};
