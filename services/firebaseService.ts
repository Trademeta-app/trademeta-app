import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { User as FirebaseUser } from "firebase/auth";
import { db } from "../src/firebase";
import { User as CustomUser, UserRole } from "../types";

export const createUserProfile = async (user: FirebaseUser): Promise<void> => {
    const userRef = doc(db, "users", user.uid);
    
    const newUserProfile: CustomUser = {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || "New User",
        role: UserRole.USER,
        balance: 0,
        holdings: [],
        transactions: [],
    };

    await setDoc(userRef, newUserProfile);
};

export const getUserProfile = async (uid: string): Promise<CustomUser | null> => {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        return docSnap.data() as CustomUser;
    } else {
        console.warn("Firestore'da bu UID'ye sahip bir kullanıcı profili bulunamadı:", uid);
        return null;
    }
};

export const updateUserProfile = async (userId: string, updatedUserData: CustomUser): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updatedUserData);
};