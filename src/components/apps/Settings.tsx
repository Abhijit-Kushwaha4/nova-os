import React, { useState } from 'react';
import { User, Palette, Monitor, HardDrive, Info, Trash2, Check } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { db, fileOperations } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
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
];

type Tab = 'personalization' | 'system' | 'about';

export const Settings: React.FC<AppProps> = () => {
  const { settings, updateSettings } = useOSStore();
  const [activeTab, setActiveTab] = useState<Tab>('personalization');
  const [username, setUsername] = useState(settings.username);

  const storageStats = useLiveQuery(() => fileOperations.getStorageStats(), []);

  const handleClearData = () => {
    if (confirm('Clear all data? This cannot be undone.')) {
      db.delete().then(() => window.location.reload());
    }
  };

  const tabs = [
    { id: 'personalization' as const, label: 'Personalization', icon: Palette },
    { id: 'system' as const, label: 'System', icon: Monitor },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <div className="h-full flex bg-card">
      <div className="w-56 border-r border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm", activeTab === tab.id ? "bg-primary/20 text-primary" : "hover:bg-secondary/50")}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto os-scrollbar">
        {activeTab === 'personalization' && (
          <div className="max-w-2xl space-y-8">
            <section>
              <h3 className="text-lg font-semibold mb-4">User Profile</h3>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onBlur={() => updateSettings({ username })} className="os-input w-full max-w-xs" />
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold mb-4">Wallpaper</h3>
              <div className="grid grid-cols-5 gap-3">
                {wallpapers.map(wp => (
                  <button key={wp.id} onClick={() => updateSettings({ wallpaper: wp.id })} className={cn("relative aspect-video rounded-lg overflow-hidden border-2", settings.wallpaper === wp.id ? "border-primary" : "border-transparent hover:border-muted-foreground")}>
                    <div className="absolute inset-0" style={{ background: wp.preview }} />
                    {settings.wallpaper === wp.id && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Check className="w-5 h-5 text-white" /></div>}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
              <div className="flex gap-3">
                {accentColors.map(color => (
                  <button key={color.id} onClick={() => updateSettings({ accentColor: color.id })} className={cn("w-10 h-10 rounded-full transition-transform hover:scale-110", settings.accentColor === color.id && "ring-2 ring-offset-2 ring-offset-background ring-foreground")} style={{ backgroundColor: color.id }} />
                ))}
              </div>
            </section>
          </div>
        )}
        {activeTab === 'system' && (
          <div className="max-w-2xl space-y-8">
            <section>
              <h3 className="text-lg font-semibold mb-4">Storage</h3>
              <div className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3 mb-3"><HardDrive className="w-5 h-5 text-muted-foreground" /><span>Local Storage</span></div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary" style={{ width: `${storageStats ? Math.min((storageStats.used / (5 * 1024 * 1024)) * 100, 100) : 0}%` }} />
                </div>
                <p className="text-sm text-muted-foreground">{storageStats ? `${(storageStats.used / 1024).toFixed(1)} KB used • ${storageStats.fileCount} files` : 'Loading...'}</p>
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold mb-4">Data Management</h3>
              <button onClick={handleClearData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30">
                <Trash2 className="w-4 h-4" />Clear All Data
              </button>
            </section>
          </div>
        )}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <div className="w-8 h-8 grid grid-cols-2 gap-0.5">
                  <div className="bg-white/90 rounded-sm" /><div className="bg-white/70 rounded-sm" />
                  <div className="bg-white/70 rounded-sm" /><div className="bg-white/90 rounded-sm" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">WebOS</h2>
                <p className="text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Browser</span><span>{navigator.userAgent.split(' ').slice(-1)[0].split('/')[0]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Platform</span><span>{navigator.platform}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Screen</span><span>{window.screen.width}x{window.screen.height}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
