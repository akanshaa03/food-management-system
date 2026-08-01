import datetime
from typing import Dict, Any

class WasteRiskService:
    """
    Core AI Prediction Engine Service
    Evaluates: Demand Forecasting, Waste Risk Prediction, Surplus Detection, Reorder Recommendation
    """
    def calculate_risk(
        self,
        inventory: Dict[str, Any],
        sales_history: float,
        expiry_date_str: str,
        previous_waste: float,
        season: str
    ) -> Dict[str, Any]:
        quantity = float(inventory.get("quantity", 0.0))
        category = str(inventory.get("category", "")).lower()
        storage = str(inventory.get("storage_condition", "")).lower()
        product_name = str(inventory.get("product_name", "Item"))

        # 1. Parse remaining days from expiry date
        remaining_days = 3.0 # Default fallback
        try:
            if "T" in expiry_date_str:
                exp_date = datetime.datetime.fromisoformat(expiry_date_str.replace("Z", "+00:00")).date()
            else:
                exp_date = datetime.datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
            today = datetime.date.today()
            remaining_days = max((exp_date - today).days, 0.5)
        except Exception:
            remaining_days = 3.0

        # 2. Demand Forecast Calculation (Daily Sales Rate * Remaining Days)
        season_multiplier = 1.0
        s_lower = season.lower()
        if "summer" in s_lower:
            season_multiplier = 1.15 if "dairy" in category or "produce" in category else 1.05
        elif "monsoon" in s_lower:
            season_multiplier = 1.20 if "bakery" in category else 0.90
        elif "winter" in s_lower:
            season_multiplier = 0.95

        effective_daily_sales = sales_history * season_multiplier
        forecasted_demand = round(effective_daily_sales * remaining_days, 2)

        # 3. Surplus Detection (Stock Quantity - Forecasted Demand)
        expected_surplus = max(round(quantity - forecasted_demand, 2), 0.0)

        # 4. Waste Risk Score Calculation
        base_risk = 0.20
        if remaining_days <= 1:
            base_risk += 0.50
        elif remaining_days <= 3:
            base_risk += 0.35
        elif remaining_days <= 7:
            base_risk += 0.15

        # Ratio of surplus to total stock
        surplus_ratio = expected_surplus / quantity if quantity > 0 else 0.0
        base_risk += (surplus_ratio * 0.30)

        # Historical waste influence
        if previous_waste > 5.0:
            base_risk += 0.10

        # Storage penalty
        if storage == "ambient" and ("dairy" in category or "cooked" in category):
            base_risk += 0.15

        waste_risk_score = min(round(base_risk, 2), 1.0)

        # Risk Level Classification
        if waste_risk_score >= 0.75:
            risk_level = "CRITICAL" if remaining_days <= 1 else "HIGH"
        elif waste_risk_score >= 0.45:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # 5. Reorder Recommendation & Recommended Action
        reorder_rec = max(round(forecasted_demand * 0.9, 2), 0.0)

        if risk_level in ["CRITICAL", "HIGH"]:
            rec_action = f"Immediate Action Required: List {expected_surplus} {inventory.get('unit', 'kg')} on NGO Redistribution Portal within {int(remaining_days * 24)} hours."
        elif risk_level == "MEDIUM":
            rec_action = f"Monitor Stock: Expected surplus of {expected_surplus} {inventory.get('unit', 'kg')}. Consider early discount."
        else:
            rec_action = f"Stock Optimal: Projected demand ({forecasted_demand} {inventory.get('unit', 'kg')}) matches inventory."

        return {
            "waste_risk_score": waste_risk_score,
            "risk_level": risk_level,
            "recommended_action": rec_action,
            "expected_surplus": expected_surplus,
            "demand_forecast_kg": forecasted_demand,
            "reorder_recommendation_kg": reorder_rec
        }
