import React, { useState, useEffect } from 'react';
import DepositRequests from './admin/DepositRequests.tsx';
import UserTable from './admin/UserTable.tsx';
import UserManagementDetail from './admin/UserManagementDetail.tsx';
import { User } from '../types.ts';
import Card from './shared/Card.tsx';

interface AdminPanelProps {
    currentUser: User | null;
    onUserUpdate: (updatedUser: User) => void;
}

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <Card className="p-6">
        <p className="text-muted text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </Card>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onUserUpdate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const pendingRequests = 0;

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const allUsers = await getAdminAllUsers();
                setUsers(allUsers);
            } catch (error) {
                console.error("Failed to fetch users for admin panel", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
    };

    const handleBackToList = () => {
        setSelectedUser(null);
    };

    const handleAdminAdjustment = async (userId: string, adjustment: { coinSymbol: string, amount: number, targetAddress: string }): Promise<User | void> => {
        try {
            const updatedUser = await adminAddHolding(userId, adjustment);
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
            if (selectedUser?.id === userId) {
                setSelectedUser(updatedUser);
            }
            if (currentUser && updatedUser.id === currentUser.id) {
                onUserUpdate(updatedUser);
            }
            return updatedUser;
        } catch (error) {
            console.error("Admin adjustment failed in AdminPanel:", error);
            throw error;
        }
    };

    const handleGenericUserUpdate = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (selectedUser?.id === updatedUser.id) {
            setSelectedUser(updatedUser);
        }
        if (currentUser && updatedUser.id === currentUser.id) {
            onUserUpdate(updatedUser);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-white">Loading Admin Panel...</div>;
    }

    if (selectedUser) {
        return <UserManagementDetail 
                    user={selectedUser} 
                    onBack={handleBackToList} 
                    onAdminAdjustment={handleAdminAdjustment} 
                    onUserUpdate={handleGenericUserUpdate} 
                />;
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                <p className="text-muted">Platform management and oversight</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={users.length} />
                <StatCard title="Pending Deposit Requests" value={pendingRequests} />
                <StatCard title="Recent Transactions (24h)" value="0" />
            </div>

            <div className="space-y-8">
                <DepositRequests />
                <UserTable users={users} onSelectUser={handleSelectUser} />
            </div>
        </div>
    );
};

export default AdminPanel;