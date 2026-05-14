from pydantic import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "InstaArchive"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "insta_archive")
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: str = os.getenv("REDIS_PORT", "6379")
    
    DOWNLOAD_DIR: str = os.getenv("DOWNLOAD_DIR", "downloads")
    
    # Instagram Session (Optional but recommended)
    INSTAGRAM_SESSION_FILE: Optional[str] = os.getenv("INSTAGRAM_SESSION_FILE")

    class Config:
        case_sensitive = True

    def __init__(self, **values):
        super().__init__(**values)
        if not self.SQLALCHEMY_DATABASE_URI:
            self.SQLALCHEMY_DATABASE_URI = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()
