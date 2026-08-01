const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

/**
 * Surplus Food Redistribution API Routes
 */

// 1. Publish Surplus Food Donation (BUSINESS Role)
router.post(
  '/publish',
  authenticate,
  authorize('BUSINESS'),
  donationController.publishDonation
);
router.post(
  '/',
  authenticate,
  authorize('BUSINESS'),
  donationController.publishDonation
);

// 2. Browse AVAILABLE Surplus Food (NGO Role)
router.get(
  '/available',
  authenticate,
  authorize('NGO'),
  donationController.getAvailableForNgo
);

// 3. Accept / Claim Surplus Food (NGO Role Only; Self-Claim Forbidden)
router.put(
  '/:id/accept',
  authenticate,
  authorize('NGO'),
  donationController.acceptDonation
);
router.post(
  '/:id/accept',
  authenticate,
  authorize('NGO'),
  donationController.acceptDonation
);

// 4. My Published Donations (BUSINESS Role)
router.get(
  '/my-donations',
  authenticate,
  authorize('BUSINESS'),
  donationController.getMyDonations
);

// 5. My Claimed Food Requests & History (NGO Role)
router.get(
  '/my-claims',
  authenticate,
  authorize('NGO'),
  donationController.getMyClaims
);
router.get(
  '/ngo-history',
  authenticate,
  authorize('NGO'),
  donationController.getNgoHistory
);

// 6. Update Donation Lifecycle Status (AVAILABLE, ACCEPTED, PICKED_UP, COMPLETED, CANCELLED)
router.patch(
  '/:id/status',
  authenticate,
  authorize('BUSINESS', 'NGO', 'SUPER_ADMIN'),
  donationController.updateDonationStatus
);
router.put(
  '/:id/status',
  authenticate,
  authorize('BUSINESS', 'NGO', 'SUPER_ADMIN'),
  donationController.updateDonationStatus
);

// 7. Delete Donation Record
router.delete(
  '/:id',
  authenticate,
  authorize('BUSINESS', 'SUPER_ADMIN'),
  donationController.deleteDonation
);

module.exports = router;
