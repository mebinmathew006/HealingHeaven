from pydantic import BaseSettings

class Settings(BaseSettings):
    user_db_url: str

    class Config:
        env_file = ".env"

settings = Settings()
