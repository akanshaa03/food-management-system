import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { Table } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Calendar, Truck, CheckCircle2, Phone, User, Clock, AlertCircle } from 'lucide-react';

export const ClaimRequestsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeClaim, setActiveClaim] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    scheduledTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    vehicleNumber: 'VAN-8891',
    driverName: 'John Michael',
    driverPhone: '+1-555-0199',
    notes: 'Refrigerated van dispatch',
  });

  const fetchClaims = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await donationService.getMyClaims();
      if (res && res.success && res.data) {
        setClaims(res.data);
      }
    } catch (err) {
      console.error('PostgreSQL My Claims fetch error:', err);
      setErrorMsg('Failed to load accepted claims from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const triggerSuccess = (msg) => {
    setFeedbackMsg(msg);
    fetchClaims();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Open Schedule Modal
  const openScheduleModal = (claim) => {
    setActiveClaim(claim);
    setScheduleForm({
      scheduledTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      vehicleNumber: 'VAN-8891',
      driverName: 'John Michael',
      driverPhone: '+1-555-0199',
      notes: 'Refrigerated vehicle ready',
    });
    setIsScheduleModalOpen(true);
  };

  // Submit Schedule Pickup
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pickupService.schedulePickup({
        donationId: activeClaim.id,
        ...scheduleForm,
      });
      setIsScheduleModalOpen(false);
      triggerSuccess('Pickup scheduled successfully in PostgreSQL! Business donor notified.');
    } catch (err) {
      setErrorMsg(`Failed to schedule pickup: ${err?.message || 'Server error'}`);
    }
  };

  // Update Status Handler (On Route / Delivered)
  const handleStatusUpdate = async (donationId, newStatus) => {
    try {
      await pickupService.updatePickupStatus(donationId, { status: newStatus });
      triggerSuccess(`Pickup status updated to "${newStatus}" in PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to update status: ${err?.message || 'Server error'}`);
    }
  };

  // Mark Delivered Handler
  const handleMarkDelivered = async (donationId) => {
    try {
      await pickupService.markDelivered(donationId);
      triggerSuccess('Pickup marked DELIVERED and donation completed in PostgreSQL!');
    } catch (err) {
      setErrorMsg(`Failed to mark delivered: ${err?.message || 'Server error'}`);
    }
  };

  const columns = [
    { header: 'Donation Title', accessorKey: 'title' },
    { header: 'Donor Business', accessorKey: 'business_name' },
    { header: 'Quantity', render: (r) => `${r.quantity} ${r.unit}` },
    { header: 'Donation Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Pickup Progress', render: (r) => <StatusBadge status={r.pickup_status || 'Pending'} /> },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openScheduleModal(r)}
            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule
          </button>

          {r.pickup_status === 'Scheduled' && (
            <button
              onClick={() => handleStatusUpdate(r.id, 'On Route')}
              className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center"
            >
              <Truck className="h-3.5 w-3.5 mr-1" /> On Route
            </button>
          )}

          {['Scheduled', 'On Route', 'Pending'].includes(r.pickup_status || 'Pending') && r.status !== 'COMPLETED' && (
            <button
              onClick={() => handleMarkDelivered(r.id)}
              className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Delivered
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pickup Management & Claim Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Schedule vehicle dispatch, update driver status, and confirm food delivery</p>
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
        <Table columns={columns} data={claims} />
      </div>

      {/* Schedule Pickup Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title={`Schedule Pickup: ${activeClaim?.title || ''}`}>
        <form className="space-y-4" onSubmit={handleScheduleSubmit}>
          <Input
            label="Scheduled Pickup Date & Time"
            type="datetime-local"
            required
            value={scheduleForm.scheduledTime}
            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vehicle Number"
              required
              value={scheduleForm.vehicleNumber}
              onChange={(e) => setScheduleForm({ ...scheduleForm, vehicleNumber: e.target.value })}
              placeholder="VAN-8891"
            />
            <Input
              label="Driver Name"
              required
              value={scheduleForm.driverName}
              onChange={(e) => setScheduleForm({ ...scheduleForm, driverName: e.target.value })}
              placeholder="John Michael"
            />
          </div>
          <Input
            label="Driver Contact Phone"
            required
            value={scheduleForm.driverPhone}
            onChange={(e) => setScheduleForm({ ...scheduleForm, driverPhone: e.target.value })}
            placeholder="+1-555-0199"
          />
          <Input
            label="Logistics / Dispatch Notes"
            value={scheduleForm.notes}
            onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
          />

          <Button type="submit" className="w-full mt-2">
            Confirm & Dispatch Pickup Schedule
          </Button>
        </form>
      </Modal>
    </div>
  );
};
