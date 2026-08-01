from fastapi import APIRouter
from app.schemas.predict import AIPredictionRequest, AIPredictionResponse
from app.services.risk_service import WasteRiskService

router = APIRouter()
risk_service = WasteRiskService()

@router.post("/analyze", response_model=AIPredictionResponse)
async def analyze_prediction(request: AIPredictionRequest):
    """
    FastAPI Explicit Endpoint: On-demand AI Prediction Engine.
    Executes Demand Forecasting, Waste Risk Prediction, Surplus Detection, and Reorder Recommendation.
    """
    result = risk_service.calculate_risk(
        inventory=request.inventory.dict(),
        sales_history=request.sales_history,
        expiry_date_str=request.expiry_date,
        previous_waste=request.previous_waste,
        season=request.season
    )
    return AIPredictionResponse(
        waste_risk_score=result["waste_risk_score"],
        risk_level=result["risk_level"],
        recommended_action=result["recommended_action"],
        expected_surplus=result["expected_surplus"],
        demand_forecast_kg=result["demand_forecast_kg"],
        reorder_recommendation_kg=result["reorder_recommendation_kg"]
    )
