import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionType } from '../../types.ts';
import { adminUpdateUserProfile, adminAdjustBalance, adminDeleteTransaction } from '../../services/firebaseService.ts';
import Card from '../shared/Card.tsx';

interface UserManagementDetailProps {
    user: User;
    onBack: () => void;
    onAdminAdjustment: (userId: string, adjustment: { coinSymbol: string, amount: number, targetAddress: string }) => Promise<User | void>;
    onUserUpdate: (updatedUser: User) => void;
}

const AddToPortfolioForm: React.FC<{ 
    userId: string; 
    onAdminAdjustment: UserManagementDetailProps['onAdminAdjustment'];
    showNotification: (type: 'success' | 'error', message: string) => void;
}> = ({ userId, onAdminAdjustment, showNotification }) => {
    const [coinSymbol, setCoinSymbol] = useState('');
    const [amount, setAmount] = useState('');
    const [targetAddress, setTargetAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = parseFloat(amount);
        if (!coinSymbol || !amount || isNaN(amountNum) || amountNum <= 0 || !targetAddress) {
            showNotification('error', 'Lütfen tüm alanları doğru bir şekilde doldurun.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdminAdjustment(userId, { coinSymbol: coinSymbol.toUpperCase(), amount: amountNum, targetAddress });
            showNotification('success', `${amountNum} ${coinSymbol.toUpperCase()} kullanıcının portföyüne başarıyla eklendi.`);
            setCoinSymbol('');
            setAmount('');
            setTargetAddress('');
        } catch (error) {
            showNotification('error', 'Portföye ekleme işlemi başarısız oldu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-4">Portföye Manuel Ekleme (Ödül/Profit)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-muted mb-1">Coin Sembolü (örn: BTC, ETH)</label>
                    <input type="text" value={coinSymbol} onChange={(e) => setCoinSymbol(e.target.value)} className="w-full bg-background border border-border-color rounded px-3 py-2" placeholder="BTC" />
                </div>
                <div>
                    <label className="block text-sm text-muted mb-1">Miktar</label>
                    <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-background border border-border-color rounded px-3 py-2" placeholder="0.5" />
                </div>
                <div>
                    <label className="block text-sm text-muted mb-1">Hedef Cüzdan Adresi</label>
                    <input type="text" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} className="w-full bg-background border border-border-color rounded px-3 py-2" placeholder="0x..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-primary-focus disabled:opacity-50">
                    {isSubmitting ? 'Ekleniyor...' : 'Portföye Ekle'}
                </button>
            </form>
        </Card>
    );
};

const UserManagementDetail: React.FC<UserManagementDetailProps> = ({ user, onBack, onAdminAdjustment, onUserUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [profileData, setProfileData] = useState({ name: user.name, email: user.email });
    const [newPassword, setNewPassword] = useState('');
    const [balanceAdjustment, setBalanceAdjustment] = useState('');
    
    useEffect(() => {
        setProfileData({ name: user.name, email: user.email });
    }, [user]);

    const showNotification = (type: 'success' | 'error', message: string, duration = 3000) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), duration);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updatedUser = await adminUpdateUserProfile(user.id, profileData);
            onUserUpdate(updatedUser);
            showNotification('success', "User profile updated successfully.");
        } catch (error) {
            showNotification('error', "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        showNotification('error', "Password changes are handled by Firebase Authentication directly and cannot be done from this panel for security reasons.");
    };

    const handleBalanceAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(balanceAdjustment);
        if (isNaN(amount)) {
            showNotification('error', 'Please enter a valid number for adjustment.');
            return;
        }
        setIsLoading(true);
        try {
            const updatedUser = await adminAdjustBalance(user.id, amount);
            onUserUpdate(updatedUser);
            setBalanceAdjustment('');
            showNotification('success', `Balance adjusted by $${amount.toFixed(2)}.`);
        } catch (error) {
            showNotification('error', 'Failed to adjust balance.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTransaction = async (tx: Transaction) => {
        if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
            return;
        }
        setIsLoading(true);
        try {
            const updatedUser = await adminDeleteTransaction(user.id, tx);
            onUserUpdate(updatedUser);
            showNotification('success', 'Transaction deleted successfully.');
        } catch (error) {
             showNotification('error', 'Failed to delete transaction.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getTypePill = (type: TransactionType) => {
        switch(type) {
            case 'Buy': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-success/20 text-success">{type}</span>;
            case 'Sell': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-danger/20 text-danger">{type}</span>;
            case 'Deposit': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">{type}</span>;
            case 'Adjustment': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400">{type}</span>;
            case 'Mt Profit': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-400">{type}</span>;
            default: return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400">{type}</span>;
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-3xl font-bold text-white">Manage User: {user.name}</h1>
                    <p className="text-muted">User ID: {user.id}</p>
                </div>
                <button onClick={onBack} className="bg-surface border border-border-color text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-border-color transition-colors">
                    &larr; Back to User List
                </button>
            </div>
            
            {notification && (
                <div className={`p-3 rounded-md text-sm text-center ${notification.type === 'success' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {notification.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">User Details</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted mb-1">Full Name</label>
                                <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-background border border-border-color rounded px-3 py-2"/>
                            </div>
                             <div>
                                <label className="block text-sm text-muted mb-1">Email</label>
                                <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full bg-background border border-border-color rounded px-3 py-2"/>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-primary-focus">Save Profile Changes</button>
                        </form>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
                         <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted mb-1">New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-background border border-border-color rounded px-3 py-2" placeholder="Not available in this panel"/>
                            </div>
                             <button type="submit" disabled={true} className="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-primary-focus opacity-50 cursor-not-allowed">Set New Password</button>
                        </form>
                    </Card>
                    <AddToPortfolioForm userId={user.id} onAdminAdjustment={onAdminAdjustment} showNotification={showNotification} />
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Balance Management</h2>
                         <form onSubmit={handleBalanceAdjust} className="space-y-4">
                             <div>
                                <label className="block text-sm text-muted mb-1">Current Balance: ${user.balance.toFixed(2)}</label>
                                <input type="number" step="any" value={balanceAdjustment} onChange={e => setBalanceAdjustment(e.target.value)} className="w-full bg-background border border-border-color rounded px-3 py-2" placeholder="e.g., 500 or -100"/>
                                <p className="text-xs text-muted mt-1">Enter a positive value to add funds, or a negative value to subtract.</p>
                            </div>
                             <button type="submit" disabled={isLoading} className="w-full bg-success text-white font-bold py-2 rounded-md hover:bg-green-600">Adjust Balance</button>
                        </form>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Asset Holdings</h2>
                        <div className="overflow-y-auto max-h-60">
                             <table className="w-full text-left text-sm">
                                <thead><tr className="border-b border-border-color"><th className="p-2 text-muted">Asset</th><th className="p-2 text-muted text-right">Amount</th><th className="p-2 text-muted text-right">Value (USD)</th></tr></thead>
                                <tbody>
                                    {Array.isArray(user.holdings) && user.holdings.map(h => (
                                        <tr key={h.symbol}>
                                            <td className="p-2 text-white">{h.name || 'N/A'}</td>
                                            <td className="p-2 text-right font-mono text-white">
                                                {typeof h.amount === 'number' ? h.amount.toFixed(6) : '-'}
                                            </td>
                                            <td className="p-2 text-right font-mono text-white">
                                                {typeof h.valueUsd === 'number' ? `$${h.valueUsd.toFixed(2)}` : '$-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!user.holdings || user.holdings.length === 0) && <tr><td colSpan={3} className="text-center p-4 text-muted">No holdings</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
                         <div className="overflow-y-auto max-h-96">
                             <table className="w-full text-left text-xs">
                                <thead><tr className="border-b border-border-color"><th className="p-1 text-muted">Date</th><th className="p-1 text-muted">Type</th><th className="p-1 text-muted">Asset</th><th className="p-1 text-muted text-right">Amount (USD)</th><th className="p-1 text-muted text-right">Actions</th></tr></thead>
                                <tbody>
                                    {Array.isArray(user.transactions) && user.transactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-border-color last:border-0 hover:bg-surface/50">
                                            <td className="p-1.5 text-muted">{tx.date ? new Date(tx.date).toLocaleString() : '-'}</td>
                                            <td className="p-1.5">{getTypePill(tx.type)}</td>
                                            <td className="p-1.5 text-white">{tx.asset || 'N/A'}</td>
                                            <td className="p-1.5 text-right font-mono text-white">
                                                {typeof tx.amountUsd === 'number' ? `$${tx.amountUsd.toFixed(2)}` : '$-'}
                                            </td>
                                            <td className="p-1.5 text-right">
                                                <button onClick={() => handleDeleteTransaction(tx)} className="text-danger hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!user.transactions || user.transactions.length === 0) && <tr><td colSpan={5} className="text-center p-4 text-muted">No transactions</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserManagementDetail;