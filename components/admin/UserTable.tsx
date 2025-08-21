import React from 'react';
import { User } from '../../types';
import Card from '../shared/Card'; // <-- EKSİK OLAN SATIR BUYDU

interface UserTableProps {
    users: User[];
    onSelectUser: (user: User) => void;
}

const UserTable: React.FC<UserTable.tsxProps> = ({ users, onSelectUser }) => {
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
                                <th className="p-3 text-muted text-right">Balance (USD)</th>
                                <th className="p-3 text-muted text-right">Holdings</th>
                                <th className="p-3 text-muted text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-border-color last:border-0 hover:bg-surface/50">
                                    <td className="p-3 text-white">{user.name}</td>
                                    <td className="p-3 text-white">{user.email}</td>
                                    <td className="p-3 text-right font-mono text-white">${user.balance.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono text-white">{user.holdings.length}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => onSelectUser(user)}
                                            className="text-primary hover:underline"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-muted">No users found.</td>
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