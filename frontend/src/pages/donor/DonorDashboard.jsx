import React from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';

export const DonorDashboard = () => {
  const stats = [
    { title: 'Total Surplus Listed', value: '450 kg', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { title: 'Meals Redistributed', value: '1,120', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'High Waste Risk Items', value: '3 Items', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { title: 'Waste Reduction Rate', value: '+84%', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
  ];

  const recentListings = [
    { title: 'Artisanal Sourdough Bread', category: 'Bakery', qty: '15 kg', status: 'AVAILABLE', risk: 'HIGH' },
    { title: 'Fresh Organic Milk (Whole)', category: 'Dairy', qty: '30 L', status: 'AVAILABLE', risk: 'MEDIUM' },
    { title: 'Cooked Vegetable Curry', category: 'Cooked Meals', qty: '40 Portions', status: 'CLAIMED', risk: 'LOW' },
  ];

  const columns = [
    { header: 'Item Name', accessorKey: 'title' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Quantity', accessorKey: 'qty' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'AI Waste Risk', render: (row) => <StatusBadge status={row.risk} /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of surplus food inventory and AI waste reduction metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Active Surplus Food Inventory</h2>
        <Table columns={columns} data={recentListings} />
      </div>
    </div>
  );
};
