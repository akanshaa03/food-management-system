const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * AI Microservice REST Proxy Routes
 * Rule: Node.js communicates with FastAPI via REST. FastAPI never directly accesses the frontend.
 */
router.post('/predict-demand', authenticate, aiController.predictDemand);
router.post('/predict-waste-risk', authenticate, aiController.predictWasteRisk);
router.post('/predict-surplus', authenticate, aiController.predictSurplus);
router.post('/reorder-recommendation', authenticate, aiController.reorderRecommendation);
router.post('/predict', authenticate, aiController.runPrediction);

module.exports = router;
