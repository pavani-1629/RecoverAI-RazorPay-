from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    database_url: str
    gemini_api_key: str

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", str(_ENV_PATH)),
        case_sensitive=False,
    )


settings = Settings()