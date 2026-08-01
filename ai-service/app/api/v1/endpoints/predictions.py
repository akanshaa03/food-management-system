from fastapi import APIRouter, HTTPException, status
from app.schemas.predict import (
    DemandForecastInput, DemandForecastOutput,
    WasteRiskInput, WasteRiskOutput,
    SurplusPredictionInput, SurplusPredictionOutput,
    ReorderRecommendationInput, ReorderRecommendationOutput
)

router = APIRouter()

@router.post("/predict-demand", response_model=DemandForecastOutput, summary="Forecast Product Demand Until Expiry")
async def predict_demand(input_data: DemandForecastInput):
    """
    POST /predict-demand
    Forecasts demand volume until product expiration based on daily sales velocity and remaining shelf-life days.
    """
    try:
        forecasted_demand = round(input_data.daily_sales_rate * input_data.remaining_days, 2)
        status_text = "OPTIMAL" if forecasted_demand >= input_data.current_stock else "SURPLUS_EXPECTED"
        
        return DemandForecastOutput(
            product_name=input_data.product_name,
            demand_forecast_kg=forecasted_demand,
            daily_sales_rate=input_data.daily_sales_rate,
            remaining_days=input_data.remaining_days,
            status=status_text
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Demand forecasting error: {str(e)}"
        )

@router.post("/predict-waste-risk", response_model=WasteRiskOutput, summary="Predict Food Waste Risk Score & Risk Level")
async def predict_waste_risk(input_data: WasteRiskInput):
    """
    POST /predict-waste-risk
    Calculates waste risk score (0.0 to 1.0) and risk level (LOW, MEDIUM, HIGH, CRITICAL).
    """
    try:
        forecasted_demand = input_data.daily_sales_rate * input_data.remaining_days
        surplus = max(input_data.current_stock - forecasted_demand, 0.0)
        
        base_score = 0.20
        if input_data.remaining_days <= 1:
            base_score += 0.50
        elif input_data.remaining_days <= 3:
            base_score += 0.30
        elif input_data.remaining_days <= 7:
            base_score += 0.15

        surplus_ratio = surplus / input_data.current_stock if input_data.current_stock > 0 else 0.0
        base_score += (surplus_ratio * 0.30)
        
        if input_data.storage_condition.lower() == "ambient" and "dairy" in input_data.category.lower():
            base_score += 0.15

        risk_score = round(min(base_score, 1.0), 2)

        if risk_score >= 0.75:
            risk_level = "CRITICAL" if input_data.remaining_days <= 1 else "HIGH"
            action = f"Schedule immediate NGO redistribution pickup within {int(input_data.remaining_days * 24)} hours."
        elif risk_score >= 0.45:
            risk_level = "MEDIUM"
            action = f"Consider early discount or partial NGO donation for {round(surplus, 1)} kg surplus."
        else:
            risk_level = "LOW"
            action = "Stock levels optimal. No immediate action required."

        return WasteRiskOutput(
            product_name=input_data.product_name,
            waste_risk_score=risk_score,
            risk_level=risk_level,
            recommended_action=action
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Waste risk prediction error: {str(e)}"
        )

@router.post("/predict-surplus", response_model=SurplusPredictionOutput, summary="Detect Expected Unconsumed Surplus Food")
async def predict_surplus(input_data: SurplusPredictionInput):
    """
    POST /predict-surplus
    Detects expected unconsumed surplus food stock in kg.
    """
    try:
        forecasted_demand = input_data.daily_sales_rate * input_data.remaining_days
        expected_surplus = max(round(input_data.current_stock - forecasted_demand, 2), 0.0)
        surplus_ratio = round((expected_surplus / input_data.current_stock) * 100, 1) if input_data.current_stock > 0 else 0.0
        
        if surplus_ratio >= 50.0:
            urgency = "URGENT_DONATION_RECOMMENDED"
        elif surplus_ratio >= 20.0:
            urgency = "MODERATE_SURPLUS"
        else:
            urgency = "LOW_SURPLUS"

        return SurplusPredictionOutput(
            product_name=input_data.product_name,
            current_stock=input_data.current_stock,
            expected_surplus_kg=expected_surplus,
            surplus_ratio_percent=surplus_ratio,
            urgency_level=urgency
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Surplus prediction error: {str(e)}"
        )

@router.post("/reorder-recommendation", response_model=ReorderRecommendationOutput, summary="Calculate Optimal Reorder Quantity")
async def reorder_recommendation(input_data: ReorderRecommendationInput):
    """
    POST /reorder-recommendation
    Calculates optimal next reorder quantity (kg) to prevent future waste while meeting demand.
    """
    try:
        lead_time_demand = input_data.daily_sales_rate * input_data.lead_time_days
        safety_stock = round(lead_time_demand * 0.25, 2)
        reorder_point = round(lead_time_demand + safety_stock, 2)
        
        # If stock is below reorder point, calculate recommended reorder quantity
        if input_data.current_stock <= reorder_point:
            rec_reorder = round((reorder_point * 2.0) - input_data.current_stock, 2)
            status_msg = "REORDER_NOW"
        else:
            rec_reorder = 0.0
            status_msg = "STOCK_SUFFICIENT"

        return ReorderRecommendationOutput(
            product_name=input_data.product_name,
            recommended_reorder_kg=rec_reorder,
            reorder_point_kg=reorder_point,
            safety_stock_kg=safety_stock,
            status=status_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Reorder recommendation error: {str(e)}"
        )
