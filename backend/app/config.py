"""Configuration settings using Pydantic Settings."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # App
    APP_NAME: str = "PrimoStore"
    APP_ENV: str = "development"
    DEBUG: bool = False
    API_VERSION: str = "v1"
    SECRET_KEY: str
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_STORAGE_BUCKET: str = "product-images"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: str = "100/minute"
    RATE_LIMIT_AUTH: str = "10/hour"
    
    # Security
    ENABLE_SECURITY_HEADERS: bool = True
    MAX_REQUEST_SIZE_MB: int = 10
    BLOCKED_IPS: str = ""
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    
    # Payment
    SUPPORT_COD: bool = True
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse allowed origins string into list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    @property
    def blocked_ips_list(self) -> List[str]:
        """Parse blocked IPs string into list."""
        if not self.BLOCKED_IPS:
            return []
        return [ip.strip() for ip in self.BLOCKED_IPS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

