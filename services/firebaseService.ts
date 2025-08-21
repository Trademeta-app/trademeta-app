import { collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, arrayRemove, writeBatch } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db } from "../src/firebase";
import { User as CustomUser, UserRole, Transaction, DepositRequest } from "../types";

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

export const updateUserInFirestore = async (userId: string, updatedUserData: CustomUser): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updatedUserData);
};

export const createDepositRequestInFirestore = async (userId: string, userName: string, amount: number, method: string): Promise<void> => {
    const requestsCollection = collection(db, "depositRequests");
    const newRequest = {
        userId: userId,
        userName: userName,
        amount: amount,
        method: method,
        status: 'Pending',
        date: new Date().toISOString(),
    };
    await addDoc(requestsCollection, newRequest);
};

export const adminGetAllUsers = async (): Promise<CustomUser[]> => {
    console.log("[firebaseService] adminGetAllUsers fonksiyonu çağrıldı.");
    try {
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => doc.data() as CustomUser);
        console.log(`[firebaseService] Firestore'dan ${userList.length} kullanıcı bulundu.`);
        return userList;
    } catch (error) {
        console.error("[firebaseService] adminGetAllUsers HATA:", error);
        return [];
    }
};

export const adminUpdateUserProfile = async (userId: string, updates: { name: string; email: string }): Promise<CustomUser> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { name: updates.name, email: updates.email });
    const updatedUserSnap = await getDoc(userRef);
    return updatedUserSnap.data() as CustomUser;
};

export const adminAdjustBalance = async (userId: string, amount: number): Promise<CustomUser> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User not found");
    const newBalance = (userSnap.data().balance || 0) + amount;
    const newTransaction: Transaction = {
        id: `admin-adj-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'Adjustment',
        asset: 'USD',
        symbol: 'USD',
        amountCoin: amount,
        amountUsd: amount,
        pricePerCoin: 1,
        status: 'Completed',
    };
    await updateDoc(userRef, {
        balance: newBalance,
        transactions: arrayUnion(newTransaction)
    });
    const updatedUserSnap = await getDoc(userRef);
    return updatedUserSnap.data() as CustomUser;
};

export const adminAddHolding = async (userId: string, adjustment: { coinSymbol: string; amount: number; targetAddress: string }): Promise<CustomUser> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User not found");
    const userData = userSnap.data() as CustomUser;
    const coinNameMap: { [key: string]: string } = { 'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'SOL': 'Solana', 'ADA': 'Cardano' };
    const coinName = coinNameMap[adjustment.coinSymbol] || adjustment.coinSymbol;
    const newTransaction: Transaction = {
        id: `admin-profit-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'Mt Profit',
        asset: coinName,
        symbol: adjustment.coinSymbol,
        amountCoin: adjustment.amount,
        amountUsd: 0,
        pricePerCoin: 0,
        status: 'Completed',
        targetAddress: adjustment.targetAddress,
    };
    let updatedHoldings = [...userData.holdings];
    const existingHoldingIndex = updatedHoldings.findIndex(h => h.symbol === adjustment.coinSymbol);
    if (existingHoldingIndex > -1) {
        updatedHoldings[existingHoldingIndex].amount += adjustment.amount;
    } else {
        updatedHoldings.push({
            name: coinName,
            symbol: adjustment.coinSymbol,
            amount: adjustment.amount,
            valueUsd: 0,
        });
    }
    await updateDoc(userRef, {
        holdings: updatedHoldings,
        transactions: arrayUnion(newTransaction)
    });
    const updatedUserSnap = await getDoc(userRef);
    return updatedUserSnap.data() as CustomUser;
};

export const adminDeleteTransaction = async (userId: string, transaction: Transaction): Promise<CustomUser> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        transactions: arrayRemove(transaction)
    });
    const updatedUserSnap = await getDoc(userRef);
    return updatedUserSnap.data() as CustomUser;
};

export const adminGetDepositRequests = async (): Promise<DepositRequest[]> => {
    const requestsCol = collection(db, "depositRequests");
    const requestSnapshot = await getDocs(requestsCol);
    return requestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepositRequest));
};

export const adminUpdateDepositStatus = async (requestId: string, userId: string, amount: number, status: 'Approved' | 'Rejected'): Promise<void> => {
    const requestRef = doc(db, "depositRequests", requestId);
    if (status === 'Approved') {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) throw new Error("User to update balance not found.");
        const newBalance = (userSnap.data().balance || 0) + amount;
        const newTransaction: Transaction = {
            id: `dep-${requestId}`,
            date: new Date().toISOString(),
            type: 'Deposit',
            asset: 'USD',
            symbol: 'USD',
            amountCoin: amount,
            amountUsd: amount,
            pricePerCoin: 1,
            status: 'Completed',
        };
        const batch = writeBatch(db);
        batch.update(requestRef, { status: status });
        batch.update(userRef, {
            balance: newBalance,
            transactions: arrayUnion(newTransaction)
        });
        await batch.commit();
    } else {
        await updateDoc(requestRef, { status: status });
    }
};