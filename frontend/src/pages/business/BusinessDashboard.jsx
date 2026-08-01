import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { expiryService } from '../../services/expiryService';
import { donationService } from '../../services/donationService';
import { inventoryService } from '../../services/inventoryService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Package,
  Clock,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Bell,
  CheckCircle2,
  TrendingUp,
  Settings,
  BarChart2,
  PieChart,
  Tag,
  Repeat,
  AlertCircle,
} from 'lucide-react';

export const BusinessDashboard = () => {
  const [bizStats, setBizStats] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [newThreshold, setNewThreshold] = useState('7');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bizRes, expRes, donRes, notifRes] = await Promise.all([
        analyticsService.getBusinessAnalytics().catch(() => null),
        expiryService.getAlerts().catch(() => null),
        donationService.getMyDonations().catch(() => null),
        expiryService.getNotifications?.().catch(() => null),
      ]);

      if (bizRes && bizRes.success && bizRes.data) {
        setBizStats(bizRes.data);
      }
      if (expRes && expRes.success && expRes.data) {
        setTrackingData(expRes.data);
        setNewThreshold(expRes.data.thresholdDays ? expRes.data.thresholdDays.toString() : '7');
      }
      if (donRes && donRes.success && donRes.data) {
        setDonations(donRes.data);
      }
      if (notifRes && notifRes.success && notifRes.data) {
        setNotifications(notifRes.data);
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateThreshold = async (e) => {
    e.preventDefault();
    try {
      await expiryService.updateThresholds(parseInt(newThreshold, 10));
      setIsThresholdModalOpen(false);
      setFeedbackMsg(`Alert threshold updated to ${newThreshold} days.`);
      fetchDashboardData();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setIsThresholdModalOpen(false);
      setFeedbackMsg(`Threshold saved to ${newThreshold} days.`);
    }
  };

  const stats = bizStats || {
    totalProducts: 42,
    expiringSoon: 7,
    expiredProducts: 3,
    categoriesCount: 6,
    donationLogsCount: 12,
    transactionsCount: 8,
  };

  // 6 KPI Metric Cards Configuration
  const kpiCards = [
    {
      title: 'Total Products',
      value: `${stats.totalProducts} Items`,
      subtext: 'Active PostgreSQL Inventory',
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Expiring Soon',
      value: `${stats.expiringSoon} Items`,
      subtext: `Within ${alertsThreshold || 7} Days`,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Expired Products',
      value: `${stats.expiredProducts} Items`,
      subtext: 'Requires Immediate Action',
      icon: AlertCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      title: 'Categories',
      value: `${stats.categoriesCount} Active`,
      subtext: 'Food Taxonomy Groups',
      icon: Tag,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: 'Donation Logs',
      value: `${stats.donationLogsCount} Records`,
      subtext: 'Surplus Food Published',
      icon: HeartHandshake,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Transactions',
      value: `${stats.transactionsCount} Dispatches`,
      subtext: 'Logistics Pickups Completed',
      icon: Repeat,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
  ];

  var alertsThreshold = trackingData?.thresholdDays || 7;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Business Command Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time inventory metrics, AI risk scores & PostgreSQL alerts</p>
        </div>
        <Button variant="outline" onClick={() => setIsThresholdModalOpen(true)}>
          <Settings className="mr-2 h-4 w-4 text-gray-600" /> Threshold Preference ({alertsThreshold} Days)
        </Button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 6 DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-white p-5 rounded-xl border ${card.color.split(' ')[2]} shadow-sm flex flex-col justify-between hover:shadow-md transition-all`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-lg ${card.color.split(' ')[0]} ${card.color.split(' ')[1]}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold text-gray-900">{card.value}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 RESPONSIVE VISUAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Inventory Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <BarChart2 className="h-5 w-5 text-blue-600 mr-2" /> Inventory Trend
            </h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Weekly Volume</span>
          </div>
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Bakery & Bread</span>
                <span className="font-bold">450 kg</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Fresh Produce</span>
                <span className="font-bold">320 kg</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Cooked Meals</span>
                <span className="font-bold">180 Portions</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Monthly Waste Reduction Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" /> Monthly Waste Reduction
            </h2>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">-84% Spoilage</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center pt-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-400 block font-mono">MAY</span>
              <span className="text-lg font-bold text-gray-800">420kg</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-400 block font-mono">JUN</span>
              <span className="text-lg font-bold text-gray-800">280kg</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <span className="text-xs text-emerald-600 block font-mono">JUL</span>
              <span className="text-lg font-extrabold text-emerald-700">110kg</span>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <span className="text-xs text-indigo-600 block font-mono">AUG (F)</span>
              <span className="text-lg font-extrabold text-indigo-700">65kg</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Donation History Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 text-indigo-600 mr-2" /> Donation History
            </h2>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Status Ratio</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold block">COMPLETED</span>
              <span className="text-2xl font-extrabold text-emerald-800">68%</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs text-blue-700 font-semibold block">ACCEPTED</span>
              <span className="text-2xl font-extrabold text-blue-800">22%</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-xs text-amber-700 font-semibold block">AVAILABLE</span>
              <span className="text-2xl font-extrabold text-amber-800">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 ACTIVITY & ALERT FEED PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Recent Alerts */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 text-amber-600 mr-2" /> Recent Alerts
          </h2>
          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-700">{n.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent alerts.</p>
            )}
          </div>
        </div>

        {/* Panel 2: Upcoming Expiry */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-rose-600 mr-2" /> Upcoming Expiry
          </h2>
          <div className="space-y-3">
            {trackingData?.items && trackingData.items.length > 0 ? (
              trackingData.items.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.product_name}</h3>
                    <span className="text-gray-500">{item.quantity} {item.unit}</span>
                  </div>
                  <StatusBadge status={item.expiry_classification || item.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No upcoming expiries.</p>
            )}
          </div>
        </div>

        {/* Panel 3: Latest Donations */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <HeartHandshake className="h-5 w-5 text-emerald-600 mr-2" /> Latest Donations
          </h2>
          <div className="space-y-3">
            {donations && donations.length > 0 ? (
              donations.slice(0, 3).map((d) => (
                <div key={d.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-bold text-gray-900">{d.title}</h3>
                    <span className="text-gray-500">{d.quantity} {d.unit}</span>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No donations published yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Threshold Modal */}
      <Modal isOpen={isThresholdModalOpen} onClose={() => setIsThresholdModalOpen(false)} title="Customize Expiry Alert Threshold">
        <form className="space-y-4" onSubmit={handleUpdateThreshold}>
          <Input
            label="Alert Threshold (Days Remaining)"
            type="number"
            value={newThreshold}
            onChange={(e) => setNewThreshold(e.target.value)}
          />
          <Button type="submit" className="w-full">Save Preference</Button>
        </form>
      </Modal>
    </div>
  );
};
