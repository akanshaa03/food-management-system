import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';

export const WasteLogPage = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    unit: 'kg',
    reason: 'Expiry',
    loss: '',
  });

  const logs = [
    { food: 'Spoiled Bananas', qty: '12 kg', reason: 'Spoilage', loss: '$24.00', date: '2026-07-28' },
    { food: 'Stale Dinner Rolls', qty: '8 kg', reason: 'Expiry', loss: '$16.00', date: '2026-07-29' },
  ];

  const columns = [
    { header: 'Food Name', accessorKey: 'food' },
    { header: 'Quantity Lost', accessorKey: 'qty' },
    { header: 'Reason', accessorKey: 'reason' },
    { header: 'Financial Loss', accessorKey: 'loss' },
    { header: 'Logged Date', accessorKey: 'date' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Food Waste Log</h1>
        <p className="text-gray-500 text-sm mt-1">Track discarded food for AI pattern learning and loss prevention</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Log Waste Entry</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Food Item Name"
              required
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              placeholder="e.g. Cooked Rice"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="10"
              />
              <Input
                label="Unit"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <Input
              label="Financial Loss ($)"
              type="number"
              value={formData.loss}
              onChange={(e) => setFormData({ ...formData, loss: e.target.value })}
              placeholder="35.00"
            />
            <Button type="submit" className="w-full">
              Record Waste Log
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Historical Waste Logs</h2>
          <Table columns={columns} data={logs} />
        </div>
      </div>
    </div>
  );
};
