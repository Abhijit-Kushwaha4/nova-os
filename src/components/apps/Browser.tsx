import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Search, X, Plus } from 'lucide-react';
import { AppProps } from '@/types/os';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  url: string;
  title: string;
}

export const Browser: React.FC<AppProps> = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'https://www.google.com/webhp?igu=1', title: 'Google' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [addressBarValue, setAddressBarValue] = useState('https://www.google.com');
  const [bookmarks] = useState([
    { name: 'Google', url: 'https://www.google.com/webhp?igu=1' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com' },
  ]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const navigateTo = (url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
      }
    }

    setTabs(tabs.map(t => 
      t.id === activeTabId ? { ...t, url: finalUrl, title: new URL(finalUrl).hostname } : t
    ));
    setAddressBarValue(finalUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigateTo(addressBarValue);
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: 'about:blank',
      title: 'New Tab'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setAddressBarValue('');
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
      setAddressBarValue(newTabs[0].url);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = activeTab?.url || '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Tabs */}
      <div className="flex items-center bg-secondary/50 border-b border-border">
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setAddressBarValue(tab.url);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] border-r border-border cursor-pointer group",
                activeTabId === tab.id ? "bg-card" : "hover:bg-secondary/50"
              )}
            >
              <span className="text-xs truncate flex-1">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-secondary transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleNewTab}
          className="p-2 hover:bg-secondary/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <button className="p-1.5 rounded hover:bg-secondary/50 transition-colors" disabled>
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 rounded hover:bg-secondary/50 transition-colors" disabled>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button 
          onClick={handleRefresh}
          className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
          <Home className="w-4 h-4" />
        </button>

        {/* Address Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={addressBarValue}
            onChange={(e) => setAddressBarValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="os-input w-full pl-10 pr-10 text-sm"
            placeholder="Search or enter URL"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-secondary/50">
            <Star className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Bookmarks */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-secondary/30">
        {bookmarks.map((bookmark, i) => (
          <button
            key={i}
            onClick={() => navigateTo(bookmark.url)}
            className="px-2 py-1 text-xs rounded hover:bg-secondary/50 transition-colors"
          >
            {bookmark.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white">
        {activeTab?.url && activeTab.url !== 'about:blank' ? (
          <iframe
            ref={iframeRef}
            src={activeTab.url}
            className="w-full h-full border-none"
            title="Browser Content"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-secondary/20">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">New Tab</h2>
              <p className="text-muted-foreground text-sm">Search or enter a URL above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
