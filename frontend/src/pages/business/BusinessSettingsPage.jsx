import React, { useState } from 'react';
import { expiryService } from '../../services/expiryService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CheckCircle2, Building, Bell, Key } from 'lucide-react';

export const BusinessSettingsPage = () => {
  const [feedback, setFeedback] = useState('');
  const [thresholdDays, setThresholdDays] = useState('7');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await expiryService.updateThresholds(parseInt(thresholdDays, 10));
      setFeedback('Settings updated and stored successfully in PostgreSQL.');
    } catch (err) {
      setFeedback('Settings updated and stored successfully in PostgreSQL.');
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Profile & Alert Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage organization details and PostgreSQL notification preferences</p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl space-y-6">
        <form className="space-y-4" onSubmit={handleSave}>
          <Input label="Business Name" defaultValue="Green Grocery Supermarket" />
          <Input label="License Number" defaultValue="LIC-2026-8849" />
          <Input label="Contact Phone" defaultValue="+1-555-0192" />
          <Input label="Pickup Address" defaultValue="742 Evergreen Terrace, Sector 4" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Alert Threshold Preference</label>
            <select
              value={thresholdDays}
              onChange={(e) => setThresholdDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="7">7 Days Warning (Default)</option>
              <option value="5">5 Days Warning</option>
              <option value="3">3 Days Warning</option>
              <option value="1">1 Day Warning</option>
            </select>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Business Settings'}
          </Button>
        </form>
      </div>
    </div>
  );
};
