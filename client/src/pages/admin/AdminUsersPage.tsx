import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import {
  Users,
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  CreditCard,
  FileText,
  Eye,
  Building
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userItem: any) => {
    const newStatus = userItem.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirm = window.confirm(`Are you sure you want to change status of ${userItem.full_name} to ${newStatus}?`);
    if (!confirm) return;

    try {
      const res = await api.put(`/admin/users/${userItem.id}/status`, { status: newStatus });
      if (res.data.success) {
        alert(res.data.message);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  const openUserDetail = async (userId: string) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data.success) {
        setSelectedUser(res.data.data);
        setModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to get user details:', err);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.mobile.includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Directory & KYC Profiles</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse registered borrowers, credit history, account status, and suspension controls. Passwords are encrypted and hidden.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {filtered.length} Users Listed
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by User Name, Email, or Mobile..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Borrower Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Monthly Income</th>
                  <th className="py-3 px-4 text-center">Applications</th>
                  <th className="py-3 px-4 text-center">Active Loans</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{u.full_name}</p>
                      <p className="text-[10px] text-slate-400">{u.email} • {u.mobile}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.city ? `${u.city}, ${u.state}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{Number(u.monthly_income || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-700">
                      {u.application_count}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      {u.active_loans_count}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openUserDetail(u.id)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="View Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition ${
                              u.status === 'ACTIVE'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedUser.full_name}</h3>
                <p className="text-xs text-slate-500">{selectedUser.email} • {selectedUser.mobile}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Employment</span>
                  <span className="font-bold text-slate-800">{selectedUser.employment_type || 'Salaried'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Company</span>
                  <span className="font-bold text-slate-800">{selectedUser.company_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Net Income</span>
                  <span className="font-bold text-slate-800">₹{Number(selectedUser.monthly_income || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Masked Account</span>
                  <span className="font-mono font-bold text-slate-800">{selectedUser.account_number_masked || 'XXXX-XXXX-8765'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Loan Applications ({selectedUser.applications?.length || 0})</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedUser.applications?.map((app: any) => (
                    <div key={app.id} className="p-2.5 rounded-xl bg-slate-50 flex justify-between items-center text-[11px]">
                      <span className="font-mono font-bold">{app.id}</span>
                      <span>₹{app.requested_amount.toLocaleString('en-IN')}</span>
                      <span className="font-semibold text-blue-600">{app.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
