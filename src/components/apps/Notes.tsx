import React, { useState } from 'react';
import { Plus, Search, Pin, PinOff, Trash2, Bold, Italic, List } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { AppProps } from '@/types/os';
import { cn } from '@/lib/utils';

export const Notes: React.FC<AppProps> = () => {
  const { notes, createNote, updateNote, deleteNote, togglePinNote } = useOSStore();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedNotes = [...notes]
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
    });

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleNewNote = () => {
    const newNote = createNote();
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(notes.find(n => n.id !== id)?.id || null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="h-full flex bg-card">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Notes</h2>
            <button
              onClick={handleNewNote}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              title="New Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="os-input w-full pl-8 text-sm h-8"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto os-scrollbar p-2">
          {sortedNotes.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            <div className="space-y-1">
              {sortedNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    selectedNoteId === note.id ? "bg-primary/20" : "hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {note.isPinned && <Pin className="w-3 h-3 text-primary shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {note.title || 'Untitled'}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {note.content || 'No content'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatDate(note.modifiedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-border">
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
                  <Bold className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
                  <Italic className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
                  <List className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePinNote(selectedNote.id)}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    selectedNote.isPinned ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
                  )}
                  title={selectedNote.isPinned ? "Unpin" : "Pin"}
                >
                  {selectedNote.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              value={selectedNote.title}
              onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
              placeholder="Title"
              className="px-4 py-3 text-xl font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            />

            {/* Content */}
            <textarea
              value={selectedNote.content}
              onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
              placeholder="Start typing..."
              className="flex-1 px-4 py-2 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground os-scrollbar"
            />

            {/* Status */}
            <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
              Last edited {formatDate(selectedNote.modifiedAt)}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p className="mb-2">Select a note or create a new one</p>
            <button
              onClick={handleNewNote}
              className="os-button-primary"
            >
              Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
