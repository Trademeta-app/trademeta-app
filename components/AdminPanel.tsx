import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { adminGetAllUsers, adminAddHolding } from '../services/firebaseService';
import UserTable from './admin/UserTable';
import UserManagementDetail from './admin/UserManagementDetail';
import Card from './shared/Card';
import DepositRequests from './admin/DepositRequests';

interface AdminPanelProps {
    currentUser: User | null;
}

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <Card className="p-6">
        <p className="text-muted text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </Card>
);

const AdminPanel: React.FC<AdminPanelProps> = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Bu state, DepositRequests bileşeninden gelen bilgiyle güncellenebilir.
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const allUsers = await adminGetAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users for admin panel:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
    };

    const handleBackToList = () => {
        setSelectedUser(null);
        // Detaydan listeye dönüldüğünde kullanıcı listesini yenile
        fetchUsers(); 
    };

    // Bu fonksiyon, herhangi bir alt bileşenden gelen güncellenmiş kullanıcı
    // bilgisini alıp ana state'i günceller.
    const handleUserUpdateInPanel = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (selectedUser?.id === updatedUser.id) {
            setSelectedUser(updatedUser);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-muted">Loading Admin Panel...</p>
            </div>
        );
    }

    if (selectedUser) {
        return <UserManagementDetail 
                    user={selectedUser} 
                    onBack={handleBackToList} 
                    onUserUpdate={handleUserUpdateInPanel} 
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
                <StatCard title="Pending Deposit Requests" value={pendingRequestsCount} />
                <StatCard title="Recent Transactions (24h)" value="N/A" />
            </div>

            <div className="space-y-8">
                {/* DepositRequests'e bir callback prop'u ekleyerek bekleyen istek sayısını alabiliriz */}
                <DepositRequests onPendingCountChange={setPendingRequestsCount} />
                <UserTable users={users} onSelectUser={handleSelectUser} />
            </div>
        </div>
    );
};

export default AdminPanel;