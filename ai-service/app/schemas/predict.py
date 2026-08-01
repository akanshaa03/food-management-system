from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

# AIPredictionRequest & Response for combined risk engine endpoint
class AIPredictionRequest(BaseModel):
    inventory: Optional[Dict[str, Any]] = None
    sales_history: Optional[float] = 0.0
    expiry_date: Optional[str] = None
    previous_waste: Optional[float] = 0.0
    season: Optional[str] = "Summer"

class AIPredictionResponse(BaseModel):
    waste_risk_score: float
    risk_level: str
    recommended_action: str
    expected_surplus: float
    demand_forecast_kg: Optional[float] = 0.0
    reorder_recommendation_kg: Optional[float] = 0.0

# Pattern Learning Request & Response
class PatternLearningRequest(BaseModel):
    sales_series: Optional[List[float]] = []
    days_to_predict: Optional[int] = 7

class PatternLearningResponse(BaseModel):
    learned_pattern: str
    confidence_score: float
    forecasted_series: List[float]

# 1. Demand Forecast Input & Output
class DemandForecastInput(BaseModel):
    product_name: str = Field(..., example="Sourdough Whole Grain Bread")
    category: str = Field("General", example="Bakery & Bread")
    current_stock: float = Field(..., gt=0, example=25.0)
    daily_sales_rate: float = Field(..., ge=0, example=3.5)
    remaining_days: float = Field(..., ge=0.5, example=3.0)

class DemandForecastOutput(BaseModel):
    product_name: str
    demand_forecast_kg: float
    daily_sales_rate: float
    remaining_days: float
    status: str

# 2. Waste Risk Input & Output
class WasteRiskInput(BaseModel):
    product_name: str = Field(..., example="Fresh Organic Milk")
    category: str = Field("Dairy", example="Dairy & Eggs")
    current_stock: float = Field(..., gt=0, example=30.0)
    daily_sales_rate: float = Field(..., ge=0, example=4.0)
    remaining_days: float = Field(..., ge=0.1, example=2.0)
    storage_condition: Optional[str] = Field("Ambient", example="Ambient")

class WasteRiskOutput(BaseModel):
    product_name: str
    waste_risk_score: float
    risk_level: str
    recommended_action: str

# 3. Surplus Prediction Input & Output
class SurplusPredictionInput(BaseModel):
    product_name: str = Field(..., example="Artisanal Sourdough Bread")
    category: str = Field("Bakery", example="Bakery")
    current_stock: float = Field(..., gt=0, example=50.0)
    daily_sales_rate: float = Field(..., ge=0, example=5.0)
    remaining_days: float = Field(..., ge=0.1, example=2.0)

class SurplusPredictionOutput(BaseModel):
    product_name: str
    current_stock: float
    expected_surplus_kg: float
    surplus_ratio_percent: float
    urgency_level: str

# 4. Reorder Recommendation Input & Output
class ReorderRecommendationInput(BaseModel):
    product_name: str = Field(..., example="Canned Tomato Soup")
    category: str = Field("Packaged", example="Packaged")
    current_stock: float = Field(..., ge=0, example=12.0)
    daily_sales_rate: float = Field(..., ge=0, example=6.0)
    lead_time_days: float = Field(3.0, ge=1.0, example=3.0)

class ReorderRecommendationOutput(BaseModel):
    product_name: str
    recommended_reorder_kg: float
    reorder_point_kg: float
    safety_stock_kg: float
    status: str
