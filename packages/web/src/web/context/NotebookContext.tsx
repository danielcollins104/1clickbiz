import { createContext, useContext, useEffect, useState } from "react";

export interface NotebookNote {
  id: string;
  title: string;
  content: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface NotebookContextValue {
  notes: NotebookNote[];
  isOpen: boolean;
  activeNoteId: string | null;
  bump: number;
  lastSavedToast: string | null;
  openNotebook: (noteId?: string) => void;
  closeNotebook: () => void;
  toggleNotebook: () => void;
  addNote: (
    content: string,
    options?: { title?: string; source?: string; openDrawer?: boolean }
  ) => NotebookNote;
  updateNote: (id: string, patch: { title?: string; content?: string }) => void;
  deleteNote: (id: string) => void;
  clearToast: () => void;
}

const STORAGE_KEY = "1cb_founder_notebook_notes";

function loadInitialNotes(): NotebookNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  const now = new Date().toISOString();
  return [
    {
      id: "note-welcome",
      title: "Welcome to Your Founder Notebook",
      content:
        "Click any paragraph or insight from Vanguard-X™ Advisor to instantly save it here as a new note. You can freely edit any note's title or text right inside this slide-out notebook!",
      source: "Vanguard-X™ System",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

const NotebookContext = createContext<NotebookContextValue | null>(null);

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<NotebookNote[]>(loadInitialNotes);
  const [isOpen, setIsOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [lastSavedToast, setLastSavedToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const openNotebook = (noteId?: string) => {
    if (noteId) setActiveNoteId(noteId);
    setIsOpen(true);
  };

  const closeNotebook = () => setIsOpen(false);
  const toggleNotebook = () => setIsOpen((o) => !o);

  const addNote = (
    content: string,
    options?: { title?: string; source?: string; openDrawer?: boolean }
  ): NotebookNote => {
    const cleanContent = content.trim();
    const firstLine = cleanContent
      .replace(/^[#*\-\d.\s⚡📍🧠🚀✓]+/, "")
      .split("\n")[0]
      ?.trim() || "Saved Advisor Note";
    const autoTitle =
      options?.title?.trim() ||
      (firstLine.length > 52 ? `${firstLine.slice(0, 52).trim()}…` : firstLine);
    const now = new Date().toISOString();
    const newNote: NotebookNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: autoTitle,
      content: cleanContent,
      source: options?.source || "Vanguard-X™ Advisor",
      createdAt: now,
      updatedAt: now,
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setBump((b) => b + 1);

    if (options?.openDrawer) {
      setIsOpen(true);
    } else {
      setLastSavedToast(`Saved to Notebook: "${autoTitle}"`);
      setTimeout(() => {
        setLastSavedToast((curr) =>
          curr === `Saved to Notebook: "${autoTitle}"` ? null : curr
        );
      }, 4000);
    }

    return newNote;
  };

  const updateNote = (id: string, patch: { title?: string; content?: string }) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              title: patch.title !== undefined ? patch.title : n.title,
              content: patch.content !== undefined ? patch.content : n.content,
              updatedAt: now,
            }
          : n
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const clearToast = () => setLastSavedToast(null);

  return (
    <NotebookContext.Provider
      value={{
        notes,
        isOpen,
        activeNoteId,
        bump,
        lastSavedToast,
        openNotebook,
        closeNotebook,
        toggleNotebook,
        addNote,
        updateNote,
        deleteNote,
        clearToast,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebook() {
  const ctx = useContext(NotebookContext);
  if (!ctx) {
    throw new Error("useNotebook must be used within a NotebookProvider");
  }
  return ctx;
}
