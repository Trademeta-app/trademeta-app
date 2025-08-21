import { User, UserRole, DepositRequest, DepositStatus, DepositMethod, Holding, Transaction, OrderType, TransactionType } from '../types.ts';

let mockUsers: User[] = [
    {
        id: 'user-1',
        name: 'Alex Johnson (Admin)',
        email: 'alex.j@example.com',
        role: UserRole.ADMIN,
        balance: 12500.75,
        holdings: [
            { symbol: 'BTC', name: 'Bitcoin', amount: 0.25, valueUsd: 17500 },
            { symbol: 'ETH', name: 'Ethereum', amount: 3.5, valueUsd: 7000 },
        ],
        transactions: [
            { id: 'txn-1', date: new Date(Date.now() - 2 * 86400000).toISOString(), type: 'Buy', orderType: 'Market', asset: 'Bitcoin', symbol: 'BTC', amountCoin: 0.1, amountUsd: 6500, pricePerCoin: 65000, status: 'Completed' },
            { id: 'txn-2', date: new Date(Date.now() - 5 * 86400000).toISOString(), type: 'Deposit', asset: 'USD', symbol: 'USD', amountCoin: 10000, amountUsd: 10000, pricePerCoin: 1, status: 'Completed' },
            { id: 'txn-3', date: new Date(Date.now() - 7 * 86400000).toISOString(), type: 'Sell', orderType: 'Limit', asset: 'Ethereum', symbol: 'ETH', amountCoin: 1.0, amountUsd: 3200, pricePerCoin: 3200, status: 'Completed' },
        ],
    },
    {
        id: 'user-2',
        name: 'Maria Garcia',
        email: 'maria.g@example.com',
        role: UserRole.USER,
        balance: 50000,
        holdings: [
            { symbol: 'SOL', name: 'Solana', amount: 100, valueUsd: 15000 },
            { symbol: 'ADA', name: 'Cardano', amount: 10000, valueUsd: 4500 },
        ],
        transactions: [
            { id: 'txn-4', date: new Date(Date.now() - 86400000).toISOString(), type: 'Deposit', asset: 'USD', symbol: 'USD', amountCoin: 60000, amountUsd: 60000, pricePerCoin: 1, status: 'Completed' },
            { id: 'txn-5', date: new Date(Date.now() - 3 * 86400000).toISOString(), type: 'Buy', orderType: 'Market', asset: 'Solana', symbol: 'SOL', amountCoin: 100, amountUsd: 15000, pricePerCoin: 150, status: 'Completed' },
        ],
    },
    {
        id: 'user-demo',
        name: 'Demo User',
        email: 'demo@trademeta.app',
        role: UserRole.USER,
        balance: 10000.00,
        holdings: [
            { symbol: 'BTC', name: 'Bitcoin', amount: 0.05, valueUsd: 3400 },
            { symbol: 'ETH', name: 'Ethereum', amount: 0.5, valueUsd: 1750 },
        ],
        transactions: [],
    }
];

export let mockDepositRequests: DepositRequest[] = [
  { id: 'dep-1', userId: 'user-1', userName: 'Alex Johnson', amount: 1000, method: DepositMethod.CRYPTO, status: DepositStatus.PENDING, date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'dep-2', userId: 'user-2', userName: 'Maria Garcia', amount: 5000, method: DepositMethod.BANK, status: DepositStatus.PENDING, date: new Date().toISOString() },
  { id: 'dep-3', userId: 'user-1', userName: 'Alex Johnson', amount: 2500, method: DepositMethod.BANK, status: DepositStatus.APPROVED, date: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const findUserById = (userId: string) => mockUsers.find(u => u.id === userId);
const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const getInitialUserData = (): Promise<User> => {
    return new Promise(resolve => setTimeout(() => resolve(deepCopy(mockUsers[0])), 500));
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
        return Promise.resolve(deepCopy(user));
    }
    return Promise.resolve(null);
};

export const updateDepositStatus = (id: string, status: DepositStatus.APPROVED | DepositStatus.REJECTED): Promise<{ request: DepositRequest, updatedUser: User | null }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const request = mockDepositRequests.find(req => req.id === id);
            if (!request) return reject(new Error("Deposit request not found"));

            request.status = status;
            const user = findUserById(request.userId);

            if (status === DepositStatus.APPROVED && user) {
                user.balance += request.amount;
                user.transactions.unshift({
                     id: `txn-dep-${Date.now()}`,
                     date: new Date().toISOString(),
                     type: 'Deposit',
                     asset: 'USD',
                     symbol: 'USD',
                     amountCoin: request.amount,
                     amountUsd: request.amount,
                     pricePerCoin: 1,
                     status: 'Completed'
                });
            }
            
            mockDepositRequests = [...mockDepositRequests];
            resolve({ request, updatedUser: user ? deepCopy(user) : null });
        }, 500);
    });
};

export const createDepositRequest = (userId: string, userName: string, amount: number, method: string): Promise<DepositRequest> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newRequest: DepositRequest = {
                id: `dep-${Date.now()}`,
                userId,
                userName,
                amount,
                method: method as DepositMethod,
                status: DepositStatus.PENDING,
                date: new Date().toISOString()
            };
            mockDepositRequests.unshift(newRequest);
            resolve(newRequest);
        }, 500);
    });
};

export const executeTrade = (user: User, tradeType: 'Buy' | 'Sell', orderType: OrderType, symbol: string, name: string, amountCoin: number, price: number): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userInDb = findUserById(user.id);
            if (!userInDb) return reject(new Error("User not found"));

            const holding = userInDb.holdings.find(h => h.symbol === symbol);
            const amountUsd = amountCoin * price;

            if (tradeType === 'Buy') {
                if (userInDb.balance < amountUsd) return resolve({ success: false, message: "Insufficient USD balance." });
                userInDb.balance -= amountUsd;
                if (holding) {
                    holding.amount += amountCoin;
                    holding.valueUsd += amountUsd;
                } else {
                    userInDb.holdings.push({ symbol, name, amount: amountCoin, valueUsd: amountUsd });
                }
            } else {
                if (!holding || holding.amount < amountCoin) return resolve({ success: false, message: `Insufficient ${symbol} balance.` });
                userInDb.balance += amountUsd;
                holding.amount -= amountCoin;
                holding.valueUsd -= amountUsd;
                if (holding.amount < 0.00001) {
                    userInDb.holdings = userInDb.holdings.filter(h => h.symbol !== symbol);
                }
            }
            
            userInDb.transactions.unshift({
                id: `txn-${Date.now()}`, date: new Date().toISOString(), type: tradeType, orderType: orderType, asset: name, symbol: symbol, amountCoin: amountCoin, amountUsd: amountUsd, pricePerCoin: price, status: 'Completed'
            });

            resolve({ success: true, message: `Successfully placed ${orderType} order to ${tradeType} ${amountCoin.toFixed(6)} ${name}.`, updatedUser: deepCopy(userInDb) });
        }, 1000);
    });
};

export const updateUserProfile = (userId: string, updates: { name?: string; email?: string }): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = findUserById(userId);
            if (user) {
                user.name = updates.name ?? user.name;
                user.email = updates.email ?? user.email;
                resolve(deepCopy(user));
            } else {
                reject(new Error("User not found"));
            }
        }, 500);
    });
};

export const changePassword = (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean, message: string }> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            const user = findUserById(userId);
            if (user && currentPassword) {
                console.log(`Password for ${user.name} changed to ${newPassword}`);
                resolve({ success: true, message: "Password updated successfully."});
            } else {
                resolve({ success: false, message: "Incorrect current password."});
            }
        }, 1000);
    });
}

export const getAdminAllUsers = (): Promise<User[]> => {
    return Promise.resolve(deepCopy(mockUsers));
};

export const adminUpdateUser = (userId: string, updates: { name: string; email: string }): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = findUserById(userId);
            if (user) {
                user.name = updates.name;
                user.email = updates.email;
                resolve(deepCopy(user));
            } else {
                reject(new Error("User not found"));
            }
        }, 500);
    });
}

export const adminChangePassword = (userId: string, newPassword: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = findUserById(userId);
            if(user) {
                console.log(`ADMIN changed password for ${user.name} to "${newPassword}"`);
                resolve(true);
            } else {
                reject(new Error("User not found"));
            }
        }, 500);
    });
}

export const adminAdjustBalance = (userId: string, amount: number): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = findUserById(userId);
            if(user) {
                user.balance += amount;
                user.transactions.unshift({
                    id: `txn-adj-${Date.now()}`,
                    date: new Date().toISOString(),
                    type: 'Adjustment',
                    asset: 'USD',
                    symbol: 'USD',
                    amountCoin: amount,
                    amountUsd: amount,
                    pricePerCoin: 1,
                    status: 'Completed'
                });
                resolve(deepCopy(user));
            } else {
                reject(new Error("User not found"));
            }
        }, 500);
    });
}

export const adminAddHolding = async (userId: string, adjustment: { coinSymbol: string, amount: number, targetAddress: string }): Promise<User> => {
    return new Promise((resolve, reject) => {
        const user = findUserById(userId);
        if (!user) {
            return reject(new Error("User not found"));
        }

        const coinNameMap: { [key: string]: string } = {
            'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'SOL': 'Solana', 'ADA': 'Cardano',
        };
        const approxPriceMap: { [key: string]: number } = {
            'BTC': 68000, 'ETH': 3500, 'SOL': 150, 'ADA': 0.45,
        };

        const coinName = coinNameMap[adjustment.coinSymbol] || adjustment.coinSymbol;
        const pricePerCoin = approxPriceMap[adjustment.coinSymbol] || 0;
        const amountUsd = adjustment.amount * pricePerCoin;

        const newTransaction: Transaction = {
            id: `admin-profit-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'Mt Profit',
            asset: coinName,
            symbol: adjustment.coinSymbol,
            amountCoin: adjustment.amount,
            amountUsd: amountUsd,
            pricePerCoin: pricePerCoin,
            status: 'Completed',
            targetAddress: adjustment.targetAddress,
        };

        const existingHolding = user.holdings.find(h => h.symbol === adjustment.coinSymbol);
        if (existingHolding) {
            existingHolding.amount += adjustment.amount;
            existingHolding.valueUsd += amountUsd;
        } else {
            user.holdings.push({
                name: coinName,
                symbol: adjustment.coinSymbol,
                amount: adjustment.amount,
                valueUsd: amountUsd,
            });
        }
        
        user.transactions.unshift(newTransaction);
        resolve(deepCopy(user));
    });
};

export const adminDeleteTransaction = (userId: string, transactionId: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = findUserById(userId);
            if (user) {
                const initialLength = user.transactions.length;
                user.transactions = user.transactions.filter(tx => tx.id !== transactionId);
                if (user.transactions.length === initialLength) {
                    return reject(new Error("Transaction not found"));
                }
                resolve(deepCopy(user));
            } else {
                reject(new Error("User not found"));
            }
        }, 500);
    });
}