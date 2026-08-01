import os

class Settings:
    PROJECT_NAME: str = "AI Food Waste Redistribution Microservice"
    API_V1_STR: str = "/api/v1"
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    DEBUG: bool = True

settings = Settings()
