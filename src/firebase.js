// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCojHEmBzwWBvD_UbiJutLHn8lqtJD0zBU",
  authDomain: "telem-8ad5a.firebaseapp.com",
  projectId: "telem-8ad5a",
  storageBucket: "telem-8ad5a.firebasestorage.app",
  messagingSenderId: "608127468542",
  appId: "1:608127468542:web:b761d856cb352644c2b6af",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // ← יצירת אינסטנס של Storage

export { db, auth, storage };