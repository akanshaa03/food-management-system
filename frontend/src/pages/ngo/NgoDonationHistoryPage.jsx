import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { Table } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, Calendar, MapPin, CheckCircle2, Trash2, HeartHandshake, AlertCircle } from 'lucide-react';

export const NgoDonationHistoryPage = () => {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await donationService.getNgoHistory();
      if (res && res.success && res.data) {
        setHistoryLogs(res.data);
      }
    } catch (err) {
      console.error('PostgreSQL Donation History fetch error:', err);
      setErrorMsg('Failed to load donation history logs from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const triggerSuccess = (msg) => {
    setFeedbackMsg(msg);
    fetchHistory();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleDeleteRecord = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove donation record "${title}" from PostgreSQL?`)) return;
    try {
      await donationService.deleteDonation(id);
      triggerSuccess(`Deleted donation record "${title}" from PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to delete record "${title}": ${err?.message || 'Server error'}`);
    }
  };

  const columns = [
    { header: 'Donation Title & Description', accessorKey: 'title' },
    { header: 'Food Business Partner', render: (r) => r.business_name || 'Green Grocery Partner' },
    { header: 'Quantity & Volume', render: (r) => `${r.quantity} ${r.unit}` },
    {
      header: 'Donation Date & Timestamp',
      render: (r) => new Date(r.created_at || Date.now()).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    },
    { header: 'Status Lifecycle', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => handleDeleteRecord(r.id, r.title)}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Record"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <History className="h-6 w-6 text-emerald-600 mr-2" /> NGO Surplus Donation History Logs
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Historical records of claimed, scheduled, and completed food redistributions in PostgreSQL</p>
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

      {/* Main Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Table columns={columns} data={historyLogs} />
      </div>
    </div>
  );
};
