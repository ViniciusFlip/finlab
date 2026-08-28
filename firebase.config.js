// firebase.config.js
 
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    initializeFirestore,
    persistentLocalCache,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    doc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
  
const firebaseConfig = {
 apiKey: "AIzaSyD-xzRjMRVUpey19g745DvPjjpCApqSHVE",
  authDomain: "myops-d7525.firebaseapp.com",
  projectId: "myops-d7525",
  storageBucket: "myops-d7525.firebasestorage.app",
  messagingSenderId: "247824192162",
  appId: "1:247824192162:web:77c91ab1e3df855dc7fdfb"
}; 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();
const db = initializeFirestore(app, {
    localCache: persistentLocalCache()
});

export {
    db,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    doc,
    deleteDoc,
    serverTimestamp,
     auth,
    provider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
};