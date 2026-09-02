from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    database_url: str = ""
    gemini_api_key: str = ""

    @field_validator("database_url", mode="before")
    @classmethod
    def sanitize_database_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", str(_ENV_PATH)),
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()