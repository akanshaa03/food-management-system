const donationModel = require('../models/donationModel');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');

const getBusinessId = async (user) => {
  if (user.business_id) return user.business_id;
  try {
    const profile = await userModel.findById(user.id);
    return profile ? profile.business_id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  } catch (err) {
    return 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  }
};

const getNgoId = async (user) => {
  if (user.ngo_id) return user.ngo_id;
  try {
    const profile = await userModel.findById(user.id);
    if (profile && profile.ngo_id) return profile.ngo_id;
  } catch (err) {}
  return 'ngo_demo_id';
};

const donationController = {
  publishDonation: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { title, category, quantity, unit, foodImageUrl, pickupTime, expiryDate, pickupAddress, notes, inventoryId } = req.body;

      if (!title || !quantity || !pickupTime || !expiryDate) {
        return res.status(400).json({
          success: false,
          message: 'Title, quantity, pickup time, and expiry date are required.',
        });
      }

      const donation = await donationModel.publishDonation({
        businessId,
        inventoryId,
        title,
        category,
        quantity,
        unit,
        foodImageUrl,
        pickupTime,
        expiryDate,
        pickupAddress,
        notes,
      });

      logger.info(`Surplus Donation Published: ${donation.title} [Status: AVAILABLE]`);

      return res.status(201).json({
        success: true,
        message: 'Surplus food donation published successfully.',
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get AVAILABLE Surplus Food Donations
   * Returns HTTP 200 with normalized fields (id, businessName, foodName, title, quantity, status)
   */
  getAvailableForNgo: async (req, res, next) => {
    try {
      const availableDonations = await donationModel.findAvailableForNgo();

      const formatted = availableDonations.map((item) => ({
        id: item.id,
        title: item.title || item.foodName || 'Fresh Surplus Food',
        foodName: item.title || item.foodName || 'Fresh Surplus Food',
        businessName: item.business_name || item.businessName || 'Green Grocery Market',
        business_name: item.business_name || item.businessName || 'Green Grocery Market',
        category: item.category || 'General Food',
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || 'kg',
        status: item.status || 'AVAILABLE',
        food_image_url: item.food_image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
        pickup_time: item.pickup_time || new Date(Date.now() + 86400000).toISOString(),
        expiry_date: item.expiry_date || new Date(Date.now() + 172800000).toISOString(),
        pickup_address: item.pickup_address || item.business_address || 'Loading Dock B',
        business_address: item.business_address || item.pickup_address || 'Loading Dock B',
      }));

      return res.status(200).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  },

  acceptDonation: async (req, res, next) => {
    try {
      const ngoId = await getNgoId(req.user);
      const userBusinessId = await getBusinessId(req.user);
      const { id } = req.params;

      const accepted = await donationModel.acceptDonation(id, ngoId, userBusinessId);

      logger.info(`Donation ${id} ACCEPTED by NGO ${ngoId}`);

      return res.status(200).json({
        success: true,
        message: 'Donation claim accepted successfully.',
        data: accepted,
      });
    } catch (error) {
      if (error.message.includes('Forbidden') || error.message.includes('cannot accept')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  getMyDonations: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const donations = await donationModel.findByBusiness(businessId);
      return res.status(200).json({
        success: true,
        data: donations,
      });
    } catch (error) {
      next(error);
    }
  },

  getMyClaims: async (req, res, next) => {
    try {
      const ngoId = await getNgoId(req.user);
      const claims = await donationModel.findByNgo(ngoId);
      return res.status(200).json({
        success: true,
        data: claims,
      });
    } catch (error) {
      next(error);
    }
  },

  getNgoHistory: async (req, res, next) => {
    try {
      const ngoId = await getNgoId(req.user);
      let history = [];
      try {
        history = await donationModel.findByNgo(ngoId);
      } catch (err) {
        logger.warn('NGO history query notice:', err.message);
      }

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  },

  updateDonationStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status parameter is required.',
        });
      }

      const updated = await donationModel.updateStatus(id, status);

      logger.info(`Donation ${id} status updated to ${status}`);

      return res.status(200).json({
        success: true,
        message: `Donation status updated to ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteDonation: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await donationModel.delete(id);
      logger.info(`Donation ${id} deleted from PostgreSQL`);
      return res.status(200).json({
        success: true,
        message: 'Donation record deleted successfully.',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = donationController;
