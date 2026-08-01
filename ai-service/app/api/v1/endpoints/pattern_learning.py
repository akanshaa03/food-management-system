from fastapi import APIRouter
from app.schemas.predict import PatternLearningRequest, PatternLearningResponse
from app.services.lstm_service import LSTMPatternService

router = APIRouter()
lstm_service = LSTMPatternService()

@router.post("/patterns", response_model=PatternLearningResponse)
async def learn_patterns(request: PatternLearningRequest):
    """
    FastAPI Endpoint: Pattern learning using LSTM neural network stub.
    """
    analysis = lstm_service.analyze_patterns(
        historical_logs=request.historical_logs,
        window_days=request.window_days
    )
    return PatternLearningResponse(
        pattern_summary=analysis["pattern_summary"],
        identified_clusters=analysis["identified_clusters"],
        peak_risk_hours=analysis["peak_risk_hours"]
    )
