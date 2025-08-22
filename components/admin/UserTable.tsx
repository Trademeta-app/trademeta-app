import React from 'react';
import { User } from '../../types';
import Card from '../shared/Card';

interface UserTableProps {
    users: User[];
    onSelectUser: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onSelectUser }) => {
    return (
        <Card>
            <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Users</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border-color">
                                <th className="p-3 text-muted">Name</th>
                                <th className="p-3 text-muted">Email</th>
                                {/* --- YENİ EKLENEN SÜTUN --- */}
                                <th className="p-3 text-muted">Gender</th>
                                <th className="p-3 text-muted text-right">Balance (USD)</th>
                                <th className="p-3 text-muted text-right">Holdings</th>
                                <th className="p-3 text-muted text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-border-color last:border-0 hover:bg-surface/50">
                                    <td className="p-3 text-white">{user.name || 'N/A'}</td>
                                    <td className="p-3 text-white">{user.email || 'N/A'}</td>
                                    {/* --- YENİ EKLENEN HÜCRE --- */}
                                    <td className="p-3 text-white capitalize">{user.gender || 'N/A'}</td>
                                    <td className="p-3 text-right font-mono text-white">
                                        {typeof user.balance === 'number' ? `$${user.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '$-'}
                                    </td>
                                    <td className="p-3 text-right font-mono text-white">
                                        {Array.isArray(user.holdings) ? user.holdings.length : 0}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => onSelectUser(user)}
                                            className="bg-primary text-background font-bold text-xs py-1 px-3 rounded-md hover:bg-primary-focus transition-colors"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {users.length === 0 && (
                                <tr>
                                    {/* colSpan değeri yeni sütun sayısına göre güncellendi */}
                                    <td colSpan={6} className="text-center p-4 text-muted">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};

export default UserTable;