import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Plus } from 'lucide-react';

export const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bakery & Bread',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
  });

  const items = [
    { id: 1, title: 'Sliced Whole Wheat Bread', category: 'Bakery', qty: '20 kg', expiry: '2026-08-02', status: 'AVAILABLE' },
    { id: 2, title: 'Canned Tomato Soup', category: 'Packaged', qty: '50 Cans', expiry: '2026-10-15', status: 'AVAILABLE' },
  ];

  const columns = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Quantity', accessorKey: 'qty' },
    { header: 'Expiry Date', accessorKey: 'expiry' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surplus Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1">List surplus food for redistribution</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Surplus Item
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Table columns={columns} data={items} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Surplus Food Item">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <Input
            label="Food Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Assorted Pastries"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="25"
            />
            <Input
              label="Unit"
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="kg / portions"
            />
          </div>
          <Input
            label="Expiry Date & Time"
            type="datetime-local"
            required
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
          <Button type="submit" className="w-full mt-2">
            Submit Item Listing
          </Button>
        </form>
      </Modal>
    </div>
  );
};
