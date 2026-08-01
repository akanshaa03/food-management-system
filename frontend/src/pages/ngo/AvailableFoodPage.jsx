import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MapPin, Clock, CheckCircle2, ShieldAlert, HeartHandshake, AlertCircle, Loader2 } from 'lucide-react';

export const AvailableFoodPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAvailableDonations = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await donationService.getAvailableForNgo();
      const itemsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      if (itemsList) {
        setDonations(itemsList.filter((d) => d.status === 'AVAILABLE'));
      }
    } catch (err) {
      console.error('PostgreSQL Available Food fetch error:', err);
      setErrorMsg('Failed to load available donations from PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDonations();
  }, []);

  const handleAcceptDonation = async (id, title) => {
    if (user?.role === 'BUSINESS') {
      alert('Forbidden. Businesses cannot accept or claim their own published donations.');
      return;
    }

    try {
      const res = await donationService.acceptDonation(id);
      if (res && res.success) {
        setFeedbackMsg(`Donation "${title}" ACCEPTED in PostgreSQL! Added to your claim requests.`);
        fetchAvailableDonations();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(`Failed to accept donation "${title}": ${err?.message || 'Server error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Available Surplus Food</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time surplus food listings available for NGO redistribution claims</p>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-800 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading available surplus food from PostgreSQL...</p>
        </div>
      ) : (
        /* Grid of AVAILABLE Surplus Donations */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {donations && donations.length > 0 ? (
            donations.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {/* Food Image Preview */}
                  <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={item.food_image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500'}
                      alt={item.title || item.foodName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
                      {item.category || 'General Food'}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">{item.title || item.foodName}</h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>{item.business_name || item.businessName}</strong> ({item.business_address || item.pickup_address})</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-600 flex-shrink-0" />
                        <span>Pickup Window: <strong>{new Date(item.pickup_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <ShieldAlert className="h-4 w-4 mr-2 text-rose-600 flex-shrink-0" />
                        <span>Expires: <strong>{new Date(item.expiry_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Quantity</span>
                    <span className="text-xl font-extrabold text-gray-900">{item.quantity} {item.unit}</span>
                  </div>
                  <Button onClick={() => handleAcceptDonation(item.id, item.title || item.foodName)}>
                    <HeartHandshake className="mr-2 h-4 w-4" /> Accept Donation
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-white p-12 rounded-xl border border-gray-200 text-center space-y-3">
              <HeartHandshake className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-800">No Available Surplus Food Currently</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">Check back soon! Food business partners regularly post surplus meals for redistribution.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
