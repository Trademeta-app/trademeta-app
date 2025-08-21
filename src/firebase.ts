import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Sizin tarafınızdan sağlanan Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyB4v15aO5u9p2o4fhP5RmeKHPLAjavco4o",
  authDomain: "trademeta-32a95.firebaseapp.com",
  projectId: "trademeta-32a95",
  storageBucket: "trademeta-32a95.appspot.com", // ".appspot.com" genellikle doğrudur
  messagingSenderId: "337154551868",
  appId: "1:337154551868:web:729f631b2dee524c8d9339",
  measurementId: "G-46FN41QS6M"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Diğer dosyalarda kullanmak üzere servisleri dışa aktar (export)
export const auth = getAuth(app);
export const db = getFirestore(app);