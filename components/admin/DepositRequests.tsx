

import React, { useState, useEffect } from 'react';
import Card from '../shared/Card.tsx';
import { DepositRequest, DepositStatus } from '../../types.ts';
import { mockDepositRequests, updateDepositStatus } from '../../services/mockDataService.ts';

const getStatusColor = (status: DepositStatus) => {
  switch (status) {
    case DepositStatus.APPROVED:
      return 'bg-success/20 text-success';
    case DepositStatus.REJECTED:
      return 'bg-danger/20 text-danger';
    case DepositStatus.PENDING:
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const DepositRequests: React.FC = () => {
    const [requests, setRequests] = useState<DepositRequest[]>(mockDepositRequests);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleUpdate = async (id: string, status: DepositStatus.APPROVED | DepositStatus.REJECTED) => {
        setLoadingId(id);
        try {
            await updateDepositStatus(id, status);
            // The mockDepositRequests array is mutated by the service, so we create a new
            // array reference to trigger a re-render.
            setRequests([...mockDepositRequests]);
        } catch (error) {
            console.error(error);
            alert('Failed to update deposit status.');
        } finally {
            setLoadingId(null);
        }
    };
    
    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-4">Deposit/Withdrawal Requests</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-muted">User</th>
                            <th className="p-3 text-sm font-semibold text-muted">Amount</th>
                            <th className="p-3 text-sm font-semibold text-muted">Method</th>
                            <th className="p-3 text-sm font-semibold text-muted">Date</th>
                            <th className="p-3 text-sm font-semibold text-muted">Status</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.filter(r => r.status === DepositStatus.PENDING).map(req => (
                            <tr key={req.id} className="border-b border-border-color hover:bg-surface/50">
                                <td className="p-3 text-white">{req.userName}</td>
                                <td className="p-3 text-white">${req.amount.toLocaleString()}</td>
                                <td className="p-3 text-white">{req.method}</td>
                                <td className="p-3 text-muted">{req.date}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                 </td>
                                <td className="p-3 text-right">
                                    {req.status === DepositStatus.PENDING ? (
                                        loadingId === req.id ? (
                                            <div className="flex justify-end"><span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span></div>
                                        ) : (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleUpdate(req.id, DepositStatus.APPROVED)} className="bg-success text-white px-3 py-1 text-sm rounded-md hover:bg-green-600 transition-colors">Approve</button>
                                                <button onClick={() => handleUpdate(req.id, DepositStatus.REJECTED)} className="bg-danger text-white px-3 py-1 text-sm rounded-md hover:bg-red-600 transition-colors">Reject</button>
                                            </div>
                                        )
                                    ) : (
                                        <span className="text-muted text-sm">Completed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {requests.filter(r => r.status === DepositStatus.PENDING).length === 0 && (
                    <p className="text-center text-muted p-6">No pending requests.</p>
                )}
            </div>
        </Card>
    );
};

export default DepositRequests;