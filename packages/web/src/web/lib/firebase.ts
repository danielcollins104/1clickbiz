import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
} from "firebase/firestore";
import { authClient } from "./auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function syncGoogleSessionToBackend(userData: {
  email: string;
  name?: string;
  image?: string;
  uid?: string;
}) {
  try {
    const res = await fetch("/api/auth/google-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("Backend session sync error:", err);
      return null;
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("runable.managed-auth.token", data.token);
      authClient.$store.notify("$sessionSignal");
    }
    return data;
  } catch (err) {
    console.warn("Could not sync session with backend:", err);
    return null;
  }
}

export async function signInWithGoogle() {
  try {
    googleProvider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, googleProvider);
    // Sync user profile to Firestore
    if (result.user) {
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(
          userRef,
          {
            userId: result.user.uid,
            email: result.user.email || "",
            displayName: result.user.displayName || "Founder",
            photoURL: (result.user.photoURL || "").slice(0, 1024),
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (firestoreErr) {
        console.warn("Could not sync profile to Firestore:", firestoreErr);
      }

      // Sync backend Better-Auth session
      await syncGoogleSessionToBackend({
        email: result.user.email || "",
        name: result.user.displayName || undefined,
        image: result.user.photoURL || undefined,
        uid: result.user.uid,
      });
    }
    return result.user;
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
}

export async function signOutUser() {
  localStorage.removeItem("runable.managed-auth.token");
  authClient.managedAuth.clearToken();
  authClient.$store.notify("$sessionSignal");
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("Firebase sign out error:", err);
  }
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as required by skill guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client is offline. Verify network connection.");
    }
  }
}
testConnection();
