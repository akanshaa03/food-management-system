from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import predictions, demand_forecast, waste_risk, pattern_learning

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Independent AI Microservice for Waste Reduction, Surplus Food Detection & Reorder Recommendations"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(predictions.router, prefix=settings.API_V1_STR, tags=["AI Microservice Endpoints"])
app.include_router(demand_forecast.router, prefix=f"{settings.API_V1_STR}/forecast", tags=["Demand Forecasting"])
app.include_router(waste_risk.router, prefix=f"{settings.API_V1_STR}/risk", tags=["Waste Risk Engine"])
app.include_router(pattern_learning.router, prefix=f"{settings.API_V1_STR}/lstm", tags=["LSTM Pattern Learning"])

@app.get("/")
def read_root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "endpoints": [
            f"{settings.API_V1_STR}/predict-demand",
            f"{settings.API_V1_STR}/predict-waste-risk",
            f"{settings.API_V1_STR}/predict-surplus",
            f"{settings.API_V1_STR}/reorder-recommendation"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
