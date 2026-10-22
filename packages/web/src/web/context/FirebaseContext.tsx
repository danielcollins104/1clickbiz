import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  syncGoogleSessionToBackend,
  handleFirestoreError,
  OperationType,
} from "../lib/firebase";

export interface BusinessDoc {
  id: string;
  name: string;
  category?: string;
  location?: string;
  summary?: string;
  status: "draft" | "active" | "launched";
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessageDoc {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  modelUsed?: string;
  groundingType?: "none" | "search" | "maps";
  sources?: Array<{ title: string; url: string }>;
  createdAt: string;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  savedBusinesses: BusinessDoc[];
  saveBusiness: (business: Omit<BusinessDoc, "id" | "createdAt"> & { id?: string }) => Promise<void>;
  saveChatMessage: (chatId: string, message: Omit<ChatMessageDoc, "id" | "createdAt">) => Promise<void>;
  loadChatMessages: (chatId: string, callback: (messages: ChatMessageDoc[]) => void) => () => void;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedBusinesses, setSavedBusinesses] = useState<BusinessDoc[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser?.email) {
        const existingToken = localStorage.getItem("runable.managed-auth.token");
        if (!existingToken) {
          syncGoogleSessionToBackend({
            email: currentUser.email,
            name: currentUser.displayName || undefined,
            image: currentUser.photoURL || undefined,
            uid: currentUser.uid,
          });
        }
      }
    });
    return unsubscribe;
  }, []);

  // Sync user's businesses in real-time from Firestore when authenticated
  useEffect(() => {
    if (!user) {
      setSavedBusinesses([]);
      return;
    }

    const path = `users/${user.uid}/businesses`;
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: BusinessDoc[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as BusinessDoc);
          });
          setSavedBusinesses(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Could not attach businesses listener:", err);
    }
  }, [user]);

  const saveBusiness = async (
    biz: Omit<BusinessDoc, "id" | "createdAt"> & { id?: string }
  ) => {
    if (!user) return;
    const bizId = biz.id || `biz_${Date.now()}`;
    const path = `users/${user.uid}/businesses`;
    try {
      const docRef = doc(db, path, bizId);
      const data: BusinessDoc & { userId: string } = {
        id: bizId,
        userId: user.uid,
        name: biz.name,
        category: biz.category || "General",
        location: biz.location || "Global",
        summary: biz.summary || "",
        status: biz.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveChatMessage = async (
    chatId: string,
    message: Omit<ChatMessageDoc, "id" | "createdAt">
  ) => {
    if (!user) return;
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `users/${user.uid}/chats/${chatId}/messages`;
    try {
      const docRef = doc(db, path, msgId);
      await setDoc(docRef, {
        id: msgId,
        userId: user.uid,
        role: message.role,
        content: message.content,
        modelUsed: message.modelUsed || "gemini-3.5-flash",
        groundingType: message.groundingType || "none",
        sources: message.sources || [],
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const loadChatMessages = (
    chatId: string,
    callback: (messages: ChatMessageDoc[]) => void
  ) => {
    if (!user) return () => {};
    const path = `users/${user.uid}/chats/${chatId}/messages`;
    try {
      const q = query(collection(db, path), orderBy("createdAt", "asc"), limit(100));
      return onSnapshot(
        q,
        (snapshot) => {
          const msgs: ChatMessageDoc[] = [];
          snapshot.forEach((snap) => {
            msgs.push(snap.data() as ChatMessageDoc);
          });
          callback(msgs);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      console.warn("Could not load chat messages:", err);
      return () => {};
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut: signOutUser,
        savedBusinesses,
        saveBusiness,
        saveChatMessage,
        loadChatMessages,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
