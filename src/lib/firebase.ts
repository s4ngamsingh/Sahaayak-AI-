import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxiGbL7vrVdEOCWJzRCuPiKhBi9sUiX0c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "heroic-unison-wzp2g.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "heroic-unison-wzp2g",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "heroic-unison-wzp2g.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "989342357095",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:989342357095:web:630fddecd78d1a71cfa6c2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleAuthProvider = new GoogleAuthProvider();
export default app;

