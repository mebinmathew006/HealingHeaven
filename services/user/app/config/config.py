from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    user_database_url: str
    cors_origins: str
    mail_username: str
    mail_password: str
    mail_from_name: str
    mail_from: str
    mail_server: str
    mail_port: int
    secret_key: str
    redis_host: str
    redis_port: int
    cloud_name: str
    cloudinary_api_key: str
    cloudinary_secret_key: str
    postgres_db: str
    postgres_user: str
    postgres_password: str
    google_client_id: str
    MAX_FILE_SIZE_MB: int = 5   
    access_expire_minutes : int
    refresh_expire_days : int
    class Config:
        env_file = ".env"
