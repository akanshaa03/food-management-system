const express = require('express');
const router = express.Router();
const expiryController = require('../controllers/expiryController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

router.use(authenticate);

router.get('/alerts', authorize('BUSINESS'), expiryController.getAlerts);
router.put('/thresholds', authorize('BUSINESS'), expiryController.updateThresholds);

module.exports = router;
