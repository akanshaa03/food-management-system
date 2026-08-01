const db = require('../config/db');

/**
 * AI Predictions Logging Model Abstraction Layer
 */
const aiModel = {
  /**
   * Save AI prediction outcome (Prophet forecast or Waste Risk output)
   */
  savePrediction: async (data) => {
    const query = `
      INSERT INTO ai_predictions (inventory_id, model_type, prediction_type, input_features, prediction_result, risk_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.inventoryId || null,
      data.modelType,
      data.predictionType,
      JSON.stringify(data.inputFeatures),
      JSON.stringify(data.predictionResult),
      data.riskScore || null,
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },
};

module.exports = aiModel;
