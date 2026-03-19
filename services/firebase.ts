import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBNfLRAiMFVPbxERs3zuFI8ymn6Od-hQ1c",
  authDomain: "die-goldsucher-app.firebaseapp.com",
  projectId: "die-goldsucher-app",
  storageBucket: "die-goldsucher-app.firebasestorage.app",
  messagingSenderId: "206652474110",
  appId: "1:206652474110:web:214eb7e9cb33a55b72dbaf",
  measurementId: "G-ZGBTMFWWW1"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
const storage = getStorage(app);
const auth = getAuth(app);

// Analytics is optional and only works in browser environments
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { db, storage, auth, analytics };
