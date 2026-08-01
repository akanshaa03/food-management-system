from fastapi import APIRouter
from app.schemas.forecast import ForecastRequest, ForecastResponse
from app.services.prophet_service import ProphetForecastingService

router = APIRouter()
forecasting_service = ProphetForecastingService()

@router.post("/demand", response_model=ForecastResponse)
async def forecast_demand(request: ForecastRequest):
    """
    FastAPI Endpoint: Predict demand using Facebook Prophet model.
    """
    forecast_data = forecasting_service.forecast_demand(
        historical_data=request.historical_data,
        forecast_days=request.forecast_days
    )
    return ForecastResponse(
        status="success",
        model="Prophet",
        forecast=forecast_data
    )
