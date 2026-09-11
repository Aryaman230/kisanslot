// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB82LzqVLpsrUnz9AH4-1A6iYPj3hR1PMI",
  authDomain: "kisanslot-363dd.firebaseapp.com",
  projectId: "kisanslot-363dd",
  storageBucket: "kisanslot-363dd.firebasestorage.app",
  messagingSenderId: "42522276507",
  appId: "1:42522276507:web:55fb37df79aa2c68c88c3e",
  measurementId: "G-X0GR13BPJC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics safely initialize karna (browser compatibility check ke sath)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);