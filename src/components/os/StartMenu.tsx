import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Power, 
  Moon, 
  RotateCcw,
  User,
  Folder,
  Terminal,
  FileText,
  Calculator,
  StickyNote,
  Settings,
  Globe,
  Image,
  Music,
  Calendar
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { cn } from '@/lib/utils';

const apps = [
  { id: 'file-explorer', name: 'File Explorer', icon: Folder, color: 'bg-amber-500' },
  { id: 'terminal', name: 'Terminal', icon: Terminal, color: 'bg-zinc-700' },
  { id: 'text-editor', name: 'Text Editor', icon: FileText, color: 'bg-blue-500' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'bg-gray-600' },
  { id: 'notes', name: 'Notes', icon: StickyNote, color: 'bg-yellow-500' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-zinc-600' },
  { id: 'browser', name: 'Browser', icon: Globe, color: 'bg-blue-600' },
  { id: 'image-viewer', name: 'Image Viewer', icon: Image, color: 'bg-purple-500' },
];

const pinnedApps = apps.slice(0, 6);

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, setStartMenuOpen, openWindow, settings } = useOSStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = useCallback((app: typeof apps[0]) => {
    openWindow(app.id, app.name, app.id, 900, 600);
    setStartMenuOpen(false);
    setSearchQuery('');
  }, [openWindow, setStartMenuOpen]);

  const handlePowerAction = (action: 'shutdown' | 'restart' | 'sleep') => {
    setStartMenuOpen(false);
    // Could add boot animation on restart
  };

  return (
    <AnimatePresence>
      {isStartMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setStartMenuOpen(false)}
          />
          
          {/* Start Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="start-menu fixed bottom-14 left-2 w-[400px] z-50 overflow-hidden"
          >
            {/* User Profile */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{settings.username}</p>
                  <p className="text-xs text-muted-foreground">Local Account</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="os-input w-full pl-10 bg-secondary/50"
                  autoFocus
                />
              </div>
            </div>

            {/* Pinned Apps */}
            {!searchQuery && (
              <div className="px-3 pb-2">
                <p className="text-xs text-muted-foreground mb-2 px-1">Pinned</p>
                <div className="grid grid-cols-4 gap-1">
                  {pinnedApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleAppClick(app)}
                      className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", app.color)}>
                        <app.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-foreground truncate w-full text-center">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Apps / Search Results */}
            <div className="px-3 pb-3 max-h-[300px] overflow-y-auto os-scrollbar">
              <p className="text-xs text-muted-foreground mb-2 px-1">
                {searchQuery ? 'Search Results' : 'All Apps'}
              </p>
              <div className="space-y-0.5">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", app.color)}>
                      <app.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-foreground">{app.name}</span>
                  </button>
                ))}
                {filteredApps.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No apps found</p>
                )}
              </div>
            </div>

            {/* Power Options */}
            <div className="p-3 border-t border-border/50 flex justify-end gap-1">
              <button 
                onClick={() => handlePowerAction('sleep')}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                title="Sleep"
              >
                <Moon className="w-4 h-4 text-muted-foreground" />
              </button>
              <button 
                onClick={() => handlePowerAction('restart')}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </button>
              <button 
                onClick={() => handlePowerAction('shutdown')}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                title="Shutdown"
              >
                <Power className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
