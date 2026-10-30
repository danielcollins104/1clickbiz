import { useEffect, useState } from "react";
import { BookOpen, Check, Copy, Download, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useNotebook } from "../context/NotebookContext";

export function NotebookDrawer() {
  const {
    notes,
    isOpen,
    activeNoteId,
    bump,
    lastSavedToast,
    openNotebook,
    closeNotebook,
    addNote,
    updateNote,
    deleteNote,
    clearToast,
  } = useNotebook();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeNotebook();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeNotebook]);

  const filteredNotes = notes.filter(
    (n) =>
      !searchQuery.trim() ||
      `${n.title} ${n.content} ${n.source}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportAll = () => {
    const content = notes
      .map(
        (n, idx) =>
          `# ${idx + 1}. ${n.title}\nSource: ${n.source} | Saved: ${new Date(
            n.updatedAt
          ).toLocaleString()}\n\n${n.content}\n\n----------------------------------------\n`
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "founder-notebook-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Slide-out Edge Tab on Right Side of Screen */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          type="button"
          onClick={() => openNotebook()}
          className="flex flex-col items-center gap-1.5 bg-ink text-sun border-2 border-r-0 border-ink px-2.5 py-3.5 shadow-[-3px_3px_0px_#000] hover:bg-sun hover:text-ink transition-all cursor-pointer"
          title="Open Slide-Out Founder Notebook"
          aria-label="Open Slide-Out Founder Notebook"
        >
          <BookOpen className="h-4 w-4 text-mint" strokeWidth={2.5} />
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Notebook
          </span>
          <span
            key={bump}
            className="pop grid h-5 min-w-5 place-items-center bg-mint text-ink text-[10px] font-black px-1 border border-ink"
          >
            {notes.length}
          </span>
        </button>
      </div>

      {/* Floating Toast when a snippet is clicked & saved from StiltZ-Kin Advisor */}
      {lastSavedToast && !isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-3 bg-ink text-sun border-[3px] border-ink px-4 py-3 shadow-[4px_4px_0px_#79e784] animate-in fade-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-mint shrink-0" strokeWidth={3} />
          <div className="text-xs">
            <p className="font-black text-mint uppercase">Added to Founder Notebook</p>
            <p className="font-bold text-paper truncate max-w-[240px]">{lastSavedToast}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearToast();
              openNotebook();
            }}
            className="btn btn-sm btn-yellow !px-2.5 !py-1 text-[11px] font-black cursor-pointer"
          >
            Open &amp; Edit →
          </button>
          <button
            type="button"
            onClick={clearToast}
            className="text-paper/70 hover:text-sun p-1 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Slide-Out Notebook Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close Founder Notebook"
            className="absolute inset-0 bg-ink/50 backdrop-blur-[1px]"
            onClick={closeNotebook}
          />
          <aside className="drawer absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l-[4px] border-ink bg-paper shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b-[3px] border-ink bg-sun px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center bg-ink text-mint b3 border-2 border-ink">
                  <BookOpen className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="display text-2xl leading-none">Founder Notebook</h2>
                    <span className="bg-ink text-mint px-2 py-0.5 text-[10px] font-black uppercase">
                      {notes.length} {notes.length === 1 ? "Note" : "Notes"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-ink/80 mt-0.5">
                    Click any StiltZ-Kin™ feedback to save here • Freely edit any note below
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-quiet !px-2 cursor-pointer"
                onClick={closeNotebook}
                aria-label="Close Notebook"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>

            {/* Action Bar: + New Blank Note, Search, Export */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink bg-cream px-4 py-3">
              <button
                type="button"
                onClick={() =>
                  addNote("Write your thoughts, action items, or strategy notes here...", {
                    title: `Founder Note #${notes.length + 1}`,
                    source: "Manual Entry",
                    openDrawer: true,
                  })
                }
                className="btn btn-sm btn-yellow text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" strokeWidth={3} /> New Blank Note
              </button>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter notes…"
                  className="input !py-1 !px-2.5 !w-36 sm:!w-44 text-xs font-bold bg-white"
                />
                {notes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportAll}
                    className="btn btn-sm btn-quiet !px-2.5 !py-1 text-xs font-black flex items-center gap-1 cursor-pointer"
                    title="Export all notes as a text file"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                )}
              </div>
            </div>

            {/* Freely Editable Notes List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-paper">
              {filteredNotes.length === 0 ? (
                <div className="b3 bg-cream p-8 text-center space-y-2">
                  <Sparkles className="h-7 w-7 mx-auto text-ink" />
                  <p className="display text-xl">No notes yet</p>
                  <p className="text-xs font-bold text-muted max-w-xs mx-auto">
                    Click any paragraph or insight inside StiltZ-Kin™ Advisor to save it here, or click &ldquo;New Blank Note&rdquo; above.
                  </p>
                </div>
              ) : (
                filteredNotes.map((note, idx) => {
                  const isActive = note.id === activeNoteId;
                  const rowsCount = Math.min(
                    12,
                    Math.max(3, note.content.split("\n").length + 1)
                  );
                  return (
                    <article
                      key={note.id}
                      className={`b3 hard p-4 transition-all ${
                        isActive ? "bg-mint/25 ring-2 ring-ink" : "bg-white"
                      }`}
                    >
                      {/* Note Top Metadata + Actions */}
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b-2 border-dashed border-ink/20">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="bg-ink text-sun px-1.5 py-0.5 text-[10px] font-black uppercase">
                            #{notes.length - idx}
                          </span>
                          <span className="bg-cream border border-ink px-2 py-0.5 text-[10px] font-extrabold uppercase truncate">
                            {note.source}
                          </span>
                          <span className="text-[10px] font-bold text-muted hidden sm:inline">
                            {new Date(note.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(note.id, `${note.title}\n\n${note.content}`)
                            }
                            className="btn btn-sm btn-quiet !px-2 !py-0.5 text-[10px] font-black cursor-pointer"
                            title="Copy note text"
                          >
                            {copiedId === note.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-700" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNote(note.id)}
                            className="btn btn-sm btn-quiet !px-1.5 !py-0.5 text-[10px] text-rose-700 hover:bg-rose-100 cursor-pointer"
                            title="Delete note"
                            aria-label="Delete note"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Freely Editable Note Title */}
                      <input
                        type="text"
                        value={note.title}
                        onFocus={() => openNotebook(note.id)}
                        onChange={(e) => updateNote(note.id, { title: e.target.value })}
                        placeholder="Note title..."
                        aria-label="Note title"
                        className="w-full bg-transparent font-extrabold text-base text-ink border-b border-transparent focus:border-ink focus:bg-cream/50 px-1 py-0.5 mb-2 focus:outline-none"
                      />

                      {/* Freely Editable Note Body */}
                      <textarea
                        rows={rowsCount}
                        value={note.content}
                        onFocus={() => openNotebook(note.id)}
                        onChange={(e) => updateNote(note.id, { content: e.target.value })}
                        placeholder="Freely edit or type your note here..."
                        aria-label="Note content"
                        className="w-full rounded-none border-2 border-ink bg-cream/40 focus:bg-white p-2.5 text-xs sm:text-sm font-semibold leading-relaxed text-ink focus:outline-none resize-y"
                      />
                      <p className="mt-1 text-[10px] font-bold text-emerald-800">
                        ✓ Auto-saved — click anywhere in the title or text above to edit freely
                      </p>
                    </article>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
