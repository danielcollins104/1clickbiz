import { createContext, useContext, useState, type ReactNode } from "react";

interface QuickStartContextType {
  isOpen: boolean;
  initialPresetId: string | null;
  openQuickStart: (presetId?: string) => void;
  closeQuickStart: () => void;
}

const QuickStartContext = createContext<QuickStartContextType | null>(null);

export function QuickStartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPresetId, setInitialPresetId] = useState<string | null>(null);

  const openQuickStart = (presetId?: string) => {
    setInitialPresetId(presetId || null);
    setIsOpen(true);
  };

  const closeQuickStart = () => {
    setIsOpen(false);
    setInitialPresetId(null);
  };

  return (
    <QuickStartContext.Provider
      value={{
        isOpen,
        initialPresetId,
        openQuickStart,
        closeQuickStart,
      }}
    >
      {children}
    </QuickStartContext.Provider>
  );
}

export function useQuickStart() {
  const context = useContext(QuickStartContext);
  if (!context) {
    throw new Error("useQuickStart must be used within a QuickStartProvider");
  }
  return context;
}
