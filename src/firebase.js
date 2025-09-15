// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCojHEmBzwWBvD_UbiJutLHn8lqtJD0zBU",
  authDomain: "telem-8ad5a.firebaseapp.com",
  projectId: "telem-8ad5a",
  storageBucket: "telem-8ad5a.firebasestorage.app",
  messagingSenderId: "608127468542",
  appId: "1:608127468542:web:b761d856cb352644c2b6af",
};

// מונע initializeApp כפול בזמן פיתוח
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
