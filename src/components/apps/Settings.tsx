import React, { useState } from 'react';
import { 
  User, 
  Palette, 
  Monitor, 
  HardDrive, 
  Info, 
  Trash2,
  Check
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { AppProps } from '@/types/os';
import { cn } from '@/lib/utils';

const wallpapers = [
  { id: 'cosmic', name: 'Cosmic', preview: 'linear-gradient(135deg, #0a0f1c 0%, #1a1040 50%, #0d1117 100%)' },
  { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #0c2d48 0%, #145374 50%, #0a1929 100%)' },
  { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #4a1c2e 0%, #2d1035 50%, #1a0a1f 100%)' },
  { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #0d1f0d 0%, #1a3320 50%, #0a1a10 100%)' },
  { id: 'aurora', name: 'Aurora', preview: 'linear-gradient(135deg, #0a2929 0%, #2d1a40 50%, #401a2d 100%)' },
];

const accentColors = [
  { id: '#3b82f6', name: 'Blue' },
  { id: '#8b5cf6', name: 'Purple' },
  { id: '#ec4899', name: 'Pink' },
  { id: '#10b981', name: 'Green' },
  { id: '#f59e0b', name: 'Amber' },
  { id: '#ef4444', name: 'Red' },
  { id: '#06b6d4', name: 'Cyan' },
];

type SettingsTab = 'personalization' | 'system' | 'about';

export const Settings: React.FC<AppProps> = () => {
  const { settings, updateSettings, fileSystem, notes } = useOSStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('personalization');
  const [username, setUsername] = useState(settings.username);

  const handleUsernameChange = () => {
    if (username.trim()) {
      updateSettings({ username: username.trim() });
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'personalization' as const, label: 'Personalization', icon: Palette },
    { id: 'system' as const, label: 'System', icon: Monitor },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  const storageUsed = new Blob([JSON.stringify(localStorage)]).size;
  const storageUsedMB = (storageUsed / 1024 / 1024).toFixed(2);

  return (
    <div className="h-full flex bg-card">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
        <div className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === tab.id ? "bg-primary/20 text-primary" : "hover:bg-secondary/50 text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto os-scrollbar">
        {activeTab === 'personalization' && (
          <div className="max-w-2xl space-y-8">
            {/* User Profile */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">User Profile</h3>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={handleUsernameChange}
                    className="os-input w-full max-w-xs"
                    placeholder="Username"
                  />
                </div>
              </div>
            </section>

            {/* Theme */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Theme</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 transition-colors",
                    settings.theme === 'dark' ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className="w-24 h-16 rounded-lg bg-zinc-900 mb-2 flex items-center justify-center">
                    <div className="w-16 h-10 rounded bg-zinc-800" />
                  </div>
                  <span className="text-sm">Dark</span>
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 transition-colors",
                    settings.theme === 'light' ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className="w-24 h-16 rounded-lg bg-gray-100 mb-2 flex items-center justify-center">
                    <div className="w-16 h-10 rounded bg-white shadow-sm" />
                  </div>
                  <span className="text-sm">Light</span>
                </button>
              </div>
            </section>

            {/* Wallpaper */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Wallpaper</h3>
              <div className="grid grid-cols-5 gap-3">
                {wallpapers.map(wp => (
                  <button
                    key={wp.id}
                    onClick={() => updateSettings({ wallpaper: wp.id })}
                    className={cn(
                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-colors",
                      settings.wallpaper === wp.id ? "border-primary" : "border-transparent hover:border-muted-foreground"
                    )}
                  >
                    <div 
                      className="absolute inset-0" 
                      style={{ background: wp.preview }}
                    />
                    {settings.wallpaper === wp.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 text-[10px] text-white/80 drop-shadow">{wp.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Accent Color */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Accent Color</h3>
              <div className="flex gap-3">
                {accentColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => updateSettings({ accentColor: color.id })}
                    className={cn(
                      "w-10 h-10 rounded-full transition-transform hover:scale-110",
                      settings.accentColor === color.id && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                    )}
                    style={{ backgroundColor: color.id }}
                    title={color.name}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="max-w-2xl space-y-8">
            {/* Storage */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Storage</h3>
              <div className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3 mb-3">
                  <HardDrive className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Local Storage</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min((storageUsed / (5 * 1024 * 1024)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {storageUsedMB} MB used of 5 MB
                </p>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>{fileSystem.length} files/folders</p>
                  <p>{notes.length} notes</p>
                </div>
              </div>
            </section>

            {/* Clear Data */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Data Management</h3>
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
              <p className="text-sm text-muted-foreground mt-2">
                This will delete all files, notes, and settings.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <div className="w-8 h-8 grid grid-cols-2 gap-0.5">
                  <div className="bg-white/90 rounded-sm" />
                  <div className="bg-white/70 rounded-sm" />
                  <div className="bg-white/70 rounded-sm" />
                  <div className="bg-white/90 rounded-sm" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">WebOS</h2>
                <p className="text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Browser</span>
                <span className="text-foreground">{navigator.userAgent.split(' ').slice(-1)[0].split('/')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span className="text-foreground">{navigator.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="text-foreground">{navigator.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Screen</span>
                <span className="text-foreground">{window.screen.width}x{window.screen.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color Depth</span>
                <span className="text-foreground">{window.screen.colorDepth}-bit</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              WebOS is a browser-based operating system experience built with React and TypeScript. 
              All data is stored locally in your browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
