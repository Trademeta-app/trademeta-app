import React, { useState, useEffect } from 'react';
import Card from '../shared/Card.tsx';
import { User } from '../../types.ts';
import { createDepositRequest } from '../../services/mockDataService.ts';
import { DepositIcon } from '../shared/Icons.tsx';

interface DepositPageProps {
    user: User;
    onDepositRequest: (updatedUser: User) => void;
}

const DepositPage: React.FC<DepositPageProps> = ({ user, onDepositRequest }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        // Simulate sending an email with deposit instructions when the page loads.
        console.log(`
            --- SIMULATED EMAIL ---
            To: ${user.email}
            Subject: Aetherium Trade - Investment Information
            
            Hello ${user.name},
            
            To make a deposit, please use the following details. After making the transfer,
            submit the form on the deposit page to notify our administrators.
            
            Bank: Aetherium Global
            Account: 123456789
            SWIFT/BIC: AETGUS33
            Reference: ${user.id}
            
            Thank you,
            The Aetherium Trade Team
            -----------------------
        `);
    }, [user.email, user.name, user.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const depositAmount = parseFloat(amount);
        if (!depositAmount || depositAmount <= 0 || !method.trim()) {
            alert('Please enter a valid amount and method.');
            return;
        }

        setIsLoading(true);
        try {
            await createDepositRequest(user.id, user.name, depositAmount, method);
            setNotification('Your request has been received and is awaiting admin approval.');
            setAmount('');
            setMethod('');
        } catch (error) {
            setNotification('There was an error submitting your request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <DepositIcon className="w-10 h-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold text-white">Deposit Funds</h1>
                    <p className="text-muted">Add funds to your virtual account.</p>
                </div>
            </div>
            
             {notification && (
                <div className="p-3 rounded-md text-sm text-center bg-success/20 text-success">
                    {notification}
                </div>
            )}

            <Card>
                 <h2 className="text-xl font-bold text-white mb-4">Step 1: Transfer Funds</h2>
                 <p className="text-muted mb-4">This is a simulation. To add funds, please use the virtual bank details below. Your registered email has also received a copy of this information.</p>
                 <div className="bg-background p-4 rounded-lg space-y-2 text-sm border border-border-color">
                    <div className="flex justify-between"><span className="font-semibold">Bank:</span><span>Aetherium Global</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Account #:</span><span>123456789</span></div>
                    <div className="flex justify-between"><span className="font-semibold">SWIFT/BIC:</span><span>AETGUS33</span></div>
                     <div className="flex justify-between"><span className="font-semibold">Reference (Required):</span><span className="font-mono text-primary">{user.id}</span></div>
                 </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Step 2: Submit Your Request</h2>
                <p className="text-muted mb-4">After making the virtual transfer, fill out this form to notify our administrators. Your balance will be updated upon approval.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-muted mb-1">Deposited Amount (USD)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 5000"
                            className="w-full bg-background border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="method" className="block text-sm font-medium text-muted mb-1">Investment Method</label>
                        <input
                            type="text"
                            id="method"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            placeholder="e.g., Bank Transfer"
                            className="w-full bg-background border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-background font-bold py-3 px-4 rounded-md hover:bg-primary-focus transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Deposit Request'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default DepositPage;
