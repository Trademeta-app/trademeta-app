import { collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, arrayRemove, writeBatch } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db } from "../src/firebase";
import { User as CustomUser, UserRole, Transaction, DepositRequest, DepositStatus, Holding } from "../types";

export const createUserProfile = async (
  fbUser: FirebaseUser,
  fullName: string,
  dateOfBirth: string,
  gender: string,
  address: string
): Promise<void> => {
  const userRef = doc(db, "users", fbUser.uid);
  
  const newUserProfile: CustomUser = {
    id: fbUser.uid,
    email: fbUser.email || "",
    name: fullName,
    role: UserRole.USER,
    balance: 0,
    holdings: [],
    transactions: [],
    dateOfBirth: dateOfBirth,
    gender: gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
    address: address,
  };
  
  await setDoc(userRef, newUserProfile);
};

export const getUserProfile = async (uid: string): Promise<CustomUser | null> => {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as CustomUser;
    } else {
        console.warn("No user profile found in Firestore for this UID:", uid);
        return null;
    }
};

export const updateUserInFirestore = async (userId: string, updatedUserData: Partial<CustomUser>): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updatedUserData);
};

export const createDepositRequestInFirestore = async (userId: string, userName: string, amount: number, method: string): Promise<void> => {
    const requestsCollection = collection(db, "depositRequests");
    const newRequest = {
        userId: userId,
        userName: userName,
        amount: amount,
        method: method,
        status: DepositStatus.PENDING,
        date: new Date().toISOString(),
    };
    await addDoc(requestsCollection, newRequest);
};

export const adminGetAllUsers = async (): Promise<CustomUser[]> => {
    try {
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomUser));
        return userList;
    } catch (error) {
        console.error("Error in adminGetAllUsers:", error);
        return [];
    }
};

export const adminUpdateUserProfile = async (userId: string, updates: Partial<CustomUser>): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
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

export const adminAddHolding = async (userId: string, adjustment: { coinSymbol: string; amount: number; }): Promise<CustomUser> => {
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
    };

    let updatedHoldings = [...(userData.holdings || [])];
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

export const adminDeleteTransaction = async (userId: string, transaction: Transaction): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        transactions: arrayRemove(transaction)
    });
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