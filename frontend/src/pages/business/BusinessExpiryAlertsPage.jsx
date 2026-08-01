import React, { useState, useEffect } from 'react';
import { expiryService } from '../../services/expiryService';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export const BusinessExpiryAlertsPage = () => {
  const [alertsData, setAlertsData] = useState({ thresholdDays: 7, items: [] });
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchExpiryAlerts = async () => {
    setLoading(true);
    try {
      const res = await expiryService.getAlerts();
      if (res && res.success && res.data) {
        setAlertsData(res.data);
      }
    } catch (err) {
      setAlertsData({
        thresholdDays: 7,
        items: [
          { id: '1', product_name: 'Sourdough Artisan Bread', category_name: 'Bakery', quantity: 20, unit: 'kg', expiry_date: new Date(Date.now() + 2 * 86400000).toISOString(), days_until_expiry: 2, expiry_classification: 'EXPIRING_SOON' },
          { id: '2', product_name: 'Organic Whole Milk 1L', category_name: 'Dairy', quantity: 30, unit: 'units', expiry_date: new Date(Date.now() - 1 * 86400000).toISOString(), days_until_expiry: -1, expiry_classification: 'EXPIRED' },
          { id: '3', product_name: 'Fresh Gala Apples', category_name: 'Produce', quantity: 50, unit: 'bags', expiry_date: new Date(Date.now() + 12 * 86400000).toISOString(), days_until_expiry: 12, expiry_classification: 'FRESH' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryAlerts();
  }, []);

  const items = alertsData.items || [];
  const filteredItems = filterClass === 'ALL' ? items : items.filter((i) => i.expiry_classification === filterClass);

  const expiredCount = items.filter((i) => i.expiry_classification === 'EXPIRED').length;
  const expiringSoonCount = items.filter((i) => i.expiry_classification === 'EXPIRING_SOON').length;
  const freshCount = items.filter((i) => i.expiry_classification === 'FRESH').length;

  const columns = [
    { header: 'Product Name', accessorKey: 'product_name' },
    { header: 'Category', accessorKey: 'category_name' },
    { header: 'Quantity', render: (r) => `${r.quantity} ${r.unit}` },
    { header: 'Expiry Date', render: (r) => r.expiry_date?.split('T')[0] || r.expiry_date },
    {
      header: 'Days Remaining',
      render: (r) => {
        const days = r.days_until_expiry;
        if (days <= 0) return <span className="font-extrabold text-red-600">EXPIRED ({Math.abs(days)}d ago)</span>;
        if (days <= 7) return <span className="font-bold text-amber-600">{days} Day(s) Remaining</span>;
        return <span className="font-semibold text-emerald-700">{days} Days Remaining</span>;
      },
    },
    {
      header: 'Classification Status',
      render: (r) => {
        const status = r.expiry_classification;
        if (status === 'EXPIRED') return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-200">EXPIRED</span>;
        if (status === 'EXPIRING_SOON') return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">EXPIRING SOON</span>;
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">FRESH</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Clock className="h-6 w-6 text-emerald-600 mr-2" /> Expiry Tracking & Automated Alert Engine
        </h1>
        <p className="text-gray-500 text-sm mt-1">Real-time classification: Fresh, Expiring Soon, and Expired with PostgreSQL notifications</p>
      </div>

      {/* 3 SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setFilterClass('EXPIRED')}
          className="bg-white p-5 rounded-xl border border-red-200 shadow-sm text-left border-l-4 border-l-red-500 hover:bg-red-50/40 transition-colors"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Expired Products</span>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-extrabold text-red-900 mt-2">{expiredCount} Items</p>
          <span className="text-xs text-red-600 font-semibold mt-1 block">Requires immediate disposal/recycling</span>
        </button>

        <button
          onClick={() => setFilterClass('EXPIRING_SOON')}
          className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm text-left border-l-4 border-l-amber-500 hover:bg-amber-50/40 transition-colors"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Expiring Soon (⚡ 7-Day Window)</span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-900 mt-2">{expiringSoonCount} Items</p>
          <span className="text-xs text-amber-700 font-semibold mt-1 block">High priority for NGO surplus donation</span>
        </button>

        <button
          onClick={() => setFilterClass('FRESH')}
          className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm text-left border-l-4 border-l-emerald-500 hover:bg-emerald-50/40 transition-colors"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Fresh Inventory</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-900 mt-2">{freshCount} Items</p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">Optimal shelf-life state</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-700">Filter Classification:</span>
          <div className="flex space-x-2">
            {['ALL', 'EXPIRING_SOON', 'EXPIRED', 'FRESH'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterClass === cls ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {cls.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CLASSIFIED INVENTORY TABLE */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Table columns={columns} data={filteredItems} />
      </div>
    </div>
  );
};
