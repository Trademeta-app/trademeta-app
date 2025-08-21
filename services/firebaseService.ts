// src/services/firebaseService.ts
import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { User as FirebaseUser } from "firebase/auth";
import { db } from "../firebase"; // Ana firebase.ts dosyamızdan db'yi import ediyoruz
import { User as CustomUser, UserRole } from "../types";

/**
 * Yeni bir kullanıcı kayıt olduğunda, Firestore'da onlar için bir profil dokümanı oluşturur.
 * @param user Firebase Authentication'dan dönen kullanıcı nesnesi
 */
export const createUserProfile = async (user: FirebaseUser): Promise<void> => {
    // Kullanıcının UID'sini, dokümanın ID'si olarak kullanacağız.
    const userRef = doc(db, "users", user.uid);
    
    const newUserProfile: CustomUser = {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || "New User",
        role: UserRole.USER, // Varsayılan olarak her yeni kullanıcı USER rolündedir
        balance: 0, // Yeni kullanıcılar 0 bakiye ile başlar
        holdings: [],
        transactions: [],
    };

    // Firestore'a bu yeni kullanıcı profilini yaz
    await setDoc(userRef, newUserProfile);
};

/**
 * Giriş yapan kullanıcının profil bilgilerini Firestore'dan çeker.
 * @param uid Giriş yapan kullanıcının Firebase UID'si
 * @returns Kullanıcı profil verisi veya bulunamazsa null
 */
export const getUserProfile = async (uid: string): Promise<CustomUser | null> => {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        // Doküman varsa, veriyi bizim CustomUser tipimize dönüştürerek döndür
        return docSnap.data() as CustomUser;
    } else {
        // Doküman bulunamadı
        console.warn("Firestore'da bu UID'ye sahip bir kullanıcı profili bulunamadı:", uid);
        return null;
    }
};