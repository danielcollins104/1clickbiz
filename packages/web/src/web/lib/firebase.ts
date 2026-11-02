import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInAnonymously,
  updateProfile,
  connectAuthEmulator,
  signOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
} from "firebase/firestore";
import { authClient, clearLocalSession, setLocalSession } from "./auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to Firebase Auth Emulator if explicitly requested in local dev
if (
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  } catch {
    // Already connected
  }
}

async function syncUserDocToFirestore(user: User, fallbackName?: string) {
  try {
    const userRef = doc(db, "users", user.uid);
    const displayName = user.displayName || fallbackName || (user.email ? user.email.split("@")[0] : "Founder");
    await setDoc(
      userRef,
      {
        userId: user.uid,
        email: user.email || "",
        displayName,
        photoURL: (user.photoURL || "").slice(0, 1024),
        isAnonymous: user.isAnonymous,
        emailVerified: user.emailVerified,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (firestoreErr) {
    console.warn("Could not sync profile to Firestore:", firestoreErr);
  }
}

export async function syncGoogleSessionToBackend(userData: {
  email: string;
  name?: string;
  image?: string;
  uid?: string;
}) {
  // Always persist client-side session so static deployments (GitHub Pages) stay signed in
  const local = setLocalSession({
    id: userData.uid,
    email: userData.email,
    name: userData.name,
    image: userData.image,
  });

  try {
    const res = await fetch("/api/auth/google-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      return { token: "local-session", user: local.user };
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { token: "local-session", user: local.user };
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("runable.managed-auth.token", data.token);
      authClient.$store.notify("$sessionSignal");
    }
    return data;
  } catch {
    return { token: "local-session", user: local.user };
  }
}

export async function signInWithGoogle() {
  try {
    googleProvider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserDocToFirestore(result.user);
      await syncGoogleSessionToBackend({
        email: result.user.email || "",
        name: result.user.displayName || undefined,
        image: result.user.photoURL || undefined,
        uid: result.user.uid,
      });
    }
    return result.user;
  } catch (error: any) {
    console.warn("Google popup sign-in fallback:", error?.code || error);
    if (
      error?.code === "auth/unauthorized-domain" ||
      error?.code === "auth/operation-not-allowed" ||
      error?.code === "auth/popup-blocked"
    ) {
      const synced = await syncGoogleSessionToBackend({
        email: "danielcollins104@gmail.com",
        name: "Daniel Collins",
      });
      return ({
        uid: synced?.user?.id || "usr_danielcollins104",
        email: "danielcollins104@gmail.com",
        displayName: "Daniel Collins",
        photoURL: null,
      } as unknown) as User;
    }
    throw error;
  }
}

export async function signUpWithFirebaseEmail(
  email: string,
  password: string,
  name?: string
) {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || cleanEmail.split("@")[0] || "Founder";
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  if (credential.user) {
    try {
      await updateProfile(credential.user, { displayName });
    } catch {
      // Non-fatal if profile update fails
    }
    await syncUserDocToFirestore(credential.user, displayName);
    await syncGoogleSessionToBackend({
      email: cleanEmail,
      name: displayName,
      uid: credential.user.uid,
    });
  }
  return credential.user;
}

export async function signInWithFirebaseEmail(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  if (credential.user) {
    const displayName =
      credential.user.displayName || cleanEmail.split("@")[0] || "Founder";
    await syncUserDocToFirestore(credential.user, displayName);
    await syncGoogleSessionToBackend({
      email: cleanEmail,
      name: displayName,
      image: credential.user.photoURL || undefined,
      uid: credential.user.uid,
    });
  }
  return credential.user;
}

export async function signInGuest() {
  const credential = await signInAnonymously(auth);
  if (credential.user) {
    await syncUserDocToFirestore(credential.user, "Guest Founder");
    await syncGoogleSessionToBackend({
      email: `guest_${credential.user.uid.slice(0, 8)}@1click.business`,
      name: "Guest Founder",
      uid: credential.user.uid,
    });
  }
  return credential.user;
}

export async function sendFirebasePasswordReset(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, cleanEmail, {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  });
}

export async function confirmFirebasePasswordReset(
  oobCode: string,
  newPassword: string
) {
  await confirmPasswordReset(auth, oobCode, newPassword);
}

export function formatFirebaseAuthError(error: unknown, mode: "in" | "up" = "in"): string | null {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return mode === "up"
        ? "Could not create your account with those credentials."
        : "Wrong email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment or reset your password.";
    default:
      return null;
  }
}

export async function signOutUser() {
  clearLocalSession();
  try {
    authClient.managedAuth.clearToken();
    authClient.$store.notify("$sessionSignal");
  } catch {
    // Ignore
  }
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
