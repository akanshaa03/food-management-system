import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Ban, ShieldCheck, Users, Trash2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getUsersList();
      if (res && res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('PostgreSQL Users fetch error:', err);
      setErrorMsg('Failed to fetch users from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerSuccess = (msg) => {
    setFeedbackMsg(msg);
    fetchUsers();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleApprove = async (id, name) => {
    try {
      await adminService.approveUser(id);
      triggerSuccess(`Approved account for "${name}" in PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to approve user "${name}": ${err?.message || 'Server error'}`);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to REJECT account application for "${name}"?`)) return;
    try {
      await adminService.rejectUser(id);
      triggerSuccess(`Rejected account application for "${name}" in PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to reject user "${name}": ${err?.message || 'Server error'}`);
    }
  };

  const handleActivate = async (id, name) => {
    try {
      await adminService.activateUser(id);
      triggerSuccess(`Activated account for "${name}" in PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to activate user "${name}": ${err?.message || 'Server error'}`);
    }
  };

  const handleSuspend = async (id, name) => {
    if (!window.confirm(`Are you sure you want to SUSPEND access for user "${name}"?`)) return;
    try {
      await adminService.suspendUser(id);
      triggerSuccess(`Suspended account access for "${name}" in PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to suspend user "${name}": ${err?.message || 'Server error'}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`PERMANENT ACTION: Are you sure you want to DELETE user account "${name}" from PostgreSQL?`)) return;
    try {
      await adminService.deleteUser(id);
      triggerSuccess(`Deleted user account "${name}" from PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to delete user "${name}": ${err?.message || 'Server error'}`);
    }
  };

  const columns = [
    { header: 'Full Name / Organization', accessorKey: 'name' },
    { header: 'Email Address', accessorKey: 'email' },
    {
      header: 'System Role',
      render: (r) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-800'}`}>
          {r.role}
        </span>
      ),
    },
    {
      header: 'Account Status',
      render: (r) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {r.is_active ? 'Active & Approved' : 'Pending / Suspended'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center space-x-2">
          {!r.is_active ? (
            <>
              <button
                onClick={() => handleApprove(r.id, r.name)}
                className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
              </button>
              <button
                onClick={() => handleReject(r.id, r.name)}
                className="px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold flex items-center shadow-sm"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
              </button>
            </>
          ) : (
            r.role !== 'SUPER_ADMIN' && (
              <button
                onClick={() => handleSuspend(r.id, r.name)}
                className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold flex items-center"
              >
                <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
              </button>
            )
          )}
          {r.role !== 'SUPER_ADMIN' && (
            <button
              onClick={() => handleDelete(r.id, r.name)}
              className="px-2 py-1 bg-gray-100 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center"
              title="Delete User Account"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 text-purple-600 mr-2" /> Super Admin User Governance Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">Approve, Reject, Suspend, Activate & Delete platform users in PostgreSQL</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh List
        </Button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-800 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Table columns={columns} data={users} />
      </div>
    </div>
  );
};
