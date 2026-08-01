"""
Prophet Demand Forecasting Service Stub
"""

class ProphetForecastingService:
    def forecast_demand(self, historical_data: list, forecast_days: int = 7) -> list:
        """
        Stub for Prophet time-series demand forecasting logic.
        Real implementation fits Prophet model on historical (ds, y) dataframe and returns forecast.
        """
        # Return mock forecast structure matching Prophet output columns (ds, yhat, yhat_lower, yhat_upper)
        mock_forecast = []
        for i in range(1, forecast_days + 1):
            mock_forecast.append({
                "ds": f"2026-08-0{i}",
                "yhat": 100.0 + (i * 5.2),
                "yhat_lower": 90.0 + (i * 4.0),
                "yhat_upper": 110.0 + (i * 6.5)
            })
        return mock_forecast
