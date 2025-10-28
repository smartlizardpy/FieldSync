import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDTvCk1Dpsbx5YKk9kMH_nlnK0R7-RsEB0",
  authDomain: "fieldsync-48024.firebaseapp.com",
  projectId: "fieldsync-48024",
  storageBucket: "fieldsync-48024.firebasestorage.app",
  messagingSenderId: "1034685391254",
  appId: "1:1034685391254:web:bff6b586315bb927f1bdb7",
  measurementId: "G-SWSEV3L1P6",
};

let appInstance: FirebaseApp | null = null;
let analyticsInstance: Analytics | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analyticsInstance) return analyticsInstance;
  try {
    if (typeof window === "undefined") return null;
    const supported = await isSupported();
    if (!supported) return null;
    analyticsInstance = getAnalytics(getFirebaseApp());
    return analyticsInstance;
  } catch (error) {
    console.warn("Analytics not available:", error);
    return null;
  }
}

export function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export function signOutFromFirebase() {
  return signOut(getFirebaseAuth());
}

export { onAuthStateChanged };

export async function ensureUserDocument(user: User) {
  const firestore = getFirebaseFirestore();
  const userRef = doc(firestore, "users", user.uid);
  try {
    await setDoc(
      userRef,
      {
        name: user.displayName ?? "",
        email: user.email ?? "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Failed to ensure user document", error);
  }
}
