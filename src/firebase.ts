// src/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4v15aO5u9p2o4fhP5RmeKHPLAjavco4o",
  authDomain: "trademeta-32a95.firebaseapp.com",
  projectId: "trademeta-32a95",
  storageBucket: "trademeta-32a95.appspot.com",
  messagingSenderId: "337154551868",
  appId: "1:337154551868:web:729f631b2dee524c8d9339",
  measurementId: "G-46FN41QS6M"
};

let app;
let auth;
let db;

// HMR (Hot Module Replacement) sırasında uygulamanın tekrar tekrar başlatılmasını engelle
if (!getApps().length) {
  try {
    console.log("[firebase.ts] Firebase'i başlatıyorum...");
    app = initializeApp(firebaseConfig);
    console.log("[firebase.ts] Firebase başarıyla başlatıldı.");
  } catch (error) {
    console.error("[firebase.ts] Firebase başlatılırken KRİTİK HATA:", error);
  }
} else {
  app = getApps()[0];
  console.log("[firebase.ts] Mevcut Firebase uygulaması kullanılıyor.");
}

auth = getAuth(app);
db = getFirestore(app);

export { auth, db };