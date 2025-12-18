from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str
    CORS_ORIGINS: str = '["http://localhost:3000"]'
    
    class Config:
        env_file = ".env"

settings = Settings()