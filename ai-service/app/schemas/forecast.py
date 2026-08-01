from pydantic import BaseModel, Field
from typing import List, Optional

class TimeSeriesPoint(BaseModel):
    ds: str = Field(..., example="2026-08-01")
    y: float = Field(..., example=150.0)

class ForecastRequest(BaseModel):
    historical_data: List[TimeSeriesPoint]
    forecast_days: int = Field(7, example=7)
    category: Optional[str] = None

class ForecastItem(BaseModel):
    ds: str
    yhat: float
    yhat_lower: float
    yhat_upper: float

class ForecastResponse(BaseModel):
    status: str = "success"
    model: str = "Prophet"
    forecast: List[ForecastItem]
