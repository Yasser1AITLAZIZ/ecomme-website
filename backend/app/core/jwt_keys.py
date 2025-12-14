"""JWT Key Manager for ECC P-256 (ES256) token verification.

This module handles fetching, caching, and verifying JWT tokens using
Supabase's JWT Signing Keys from the JWKS endpoint.
"""
import time
import logging
import jwt
import httpx
from typing import Dict, Optional, Any
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from app.config import settings

logger = logging.getLogger(__name__)


class JWKKeyManager:
    """Manages JWT signing keys from Supabase JWKS endpoint."""
    
    def __init__(self, jwks_url: Optional[str] = None, cache_ttl: int = 3600):
        """
        Initialize the JWT Key Manager.
        
        Args:
            jwks_url: JWKS endpoint URL. If None, constructed from SUPABASE_URL
            cache_ttl: Cache TTL in seconds (default: 3600 = 1 hour)
        """
        self.jwks_url = jwks_url or f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        self.cache_ttl = cache_ttl
        self._keys_cache: Dict[str, Dict[str, Any]] = {}
        self._cache_timestamp: float = 0
        self._public_keys: Dict[str, Any] = {}
    
    def _is_cache_valid(self) -> bool:
        """Check if the cached keys are still valid."""
        if not self._keys_cache:
            return False
        return (time.time() - self._cache_timestamp) < self.cache_ttl
    
    async def fetch_keys(self) -> Dict[str, Dict[str, Any]]:
        """
        Fetch JWT signing keys from Supabase JWKS endpoint.
        
        Returns:
            Dictionary mapping key IDs (kid) to key data
            
        Raises:
            Exception: If fetching keys fails
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.jwks_url)
                response.raise_for_status()
                jwks_data = response.json()
                
                keys = {}
                for key_data in jwks_data.get("keys", []):
                    kid = key_data.get("kid")
                    if kid:
                        keys[kid] = key_data
                
                logger.info(f"Fetched {len(keys)} JWT signing keys from JWKS endpoint")
                return keys
                
        except httpx.RequestError as e:
            logger.error(f"Failed to fetch JWKS keys: {str(e)}")
            raise Exception(f"Failed to fetch JWT signing keys: {str(e)}")
        except Exception as e:
            logger.error(f"Error parsing JWKS response: {str(e)}")
            raise Exception(f"Invalid JWKS response: {str(e)}")
    
    def _convert_jwk_to_pem(self, jwk: Dict[str, Any]) -> str:
        """
        Convert JWK (JSON Web Key) to PEM format for cryptography library.
        
        Args:
            jwk: JWK key data
            
        Returns:
            PEM-formatted public key string
        """
        # Extract key parameters
        kty = jwk.get("kty")
        crv = jwk.get("crv")
        x = jwk.get("x")
        y = jwk.get("y")
        
        if kty != "EC" or crv != "P-256":
            raise ValueError(f"Unsupported key type: {kty}/{crv}. Only EC P-256 is supported.")
        
        if not x or not y:
            raise ValueError("Missing required key parameters (x, y)")
        
        # Decode base64url encoded coordinates
        import base64
        
        # Add padding if needed for base64url decoding
        def add_padding(s: str) -> str:
            padding = 4 - (len(s) % 4)
            return s + ("=" * padding) if padding != 4 else s
        
        x_bytes = base64.urlsafe_b64decode(add_padding(x))
        y_bytes = base64.urlsafe_b64decode(add_padding(y))
        
        # Create ECC public key
        public_numbers = ec.EllipticCurvePublicNumbers(
            int.from_bytes(x_bytes, "big"),
            int.from_bytes(y_bytes, "big"),
            ec.SECP256R1()  # P-256 curve
        )
        public_key = public_numbers.public_key(default_backend())
        
        # Serialize to PEM format
        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return pem.decode("utf-8")
    
    async def _ensure_keys_loaded(self) -> None:
        """Ensure keys are loaded in cache."""
        if not self._is_cache_valid():
            keys = await self.fetch_keys()
            self._keys_cache = keys
            self._cache_timestamp = time.time()
            
            # Convert JWKs to PEM format for verification
            self._public_keys = {}
            for kid, jwk in keys.items():
                try:
                    pem_key = self._convert_jwk_to_pem(jwk)
                    self._public_keys[kid] = pem_key
                except Exception as e:
                    logger.warning(f"Failed to convert key {kid} to PEM: {str(e)}")
    
    def get_key(self, kid: str) -> Optional[str]:
        """
        Get PEM-formatted public key by Key ID.
        
        Args:
            kid: Key ID
            
        Returns:
            PEM-formatted public key or None if not found
        """
        return self._public_keys.get(kid)
    
    async def verify_token(
        self,
        token: str,
        audience: Optional[str] = "authenticated",
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Verify JWT token using appropriate signing key.
        
        This method supports both:
        - ES256 (ECC P-256): Uses JWKS keys from Supabase
        - HS256 (Legacy): Uses shared secret from SUPABASE_JWT_SECRET
        
        Args:
            token: JWT token string
            audience: Expected audience (default: "authenticated")
            options: Additional JWT decode options
            
        Returns:
            Decoded token payload
            
        Raises:
            jwt.InvalidTokenError: If token is invalid
            Exception: If no valid key is found
        """
        # Decode token header to get algorithm
        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            alg = unverified_header.get("alg", "ES256")
        except Exception as e:
            raise jwt.InvalidTokenError(f"Invalid token header: {str(e)}")
        
        # Prepare decode options
        decode_options = {
            "verify_signature": True,
            "verify_exp": True,
            "verify_aud": audience is not None,
            **{**(options or {})}
        }
        
        # Handle HS256 (Legacy) tokens
        if alg == "HS256":
            logger.debug("Verifying HS256 (Legacy) token with shared secret")
            jwt_secret = getattr(settings, 'SUPABASE_JWT_SECRET', None)
            if not jwt_secret:
                raise jwt.InvalidTokenError("HS256 tokens require SUPABASE_JWT_SECRET to be configured")
            
            try:
                decoded = jwt.decode(
                    token,
                    jwt_secret,
                    algorithms=["HS256"],
                    audience=audience,
                    options=decode_options
                )
                logger.debug("HS256 token verified successfully with shared secret")
                return decoded
            except jwt.ExpiredSignatureError:
                raise
            except jwt.InvalidTokenError as e:
                raise jwt.InvalidTokenError(f"HS256 token verification failed: {str(e)}")
        
        # Handle ES256 (ECC P-256) tokens
        if alg != "ES256":
            raise jwt.InvalidTokenError(f"Unsupported algorithm: {alg}. Only ES256 and HS256 are supported.")
        
        # Ensure keys are loaded for ES256
        await self._ensure_keys_loaded()
        
        # Try to verify with the key specified by kid
        if kid and kid in self._public_keys:
            try:
                public_key = self._public_keys[kid]
                decoded = jwt.decode(
                    token,
                    public_key,
                    algorithms=["ES256"],
                    audience=audience,
                    options=decode_options
                )
                logger.debug(f"Token verified successfully with key {kid}")
                return decoded
            except jwt.InvalidSignatureError:
                logger.warning(f"Token signature verification failed with key {kid}, trying other keys...")
            except jwt.ExpiredSignatureError:
                raise
            except jwt.InvalidTokenError as e:
                logger.warning(f"Token verification failed with key {kid}: {str(e)}")
        
        # If verification with kid fails, try all available keys (for key rotation)
        logger.debug(f"Trying all available keys for token verification...")
        last_error = None
        
        for try_kid, public_key in self._public_keys.items():
            try:
                decoded = jwt.decode(
                    token,
                    public_key,
                    algorithms=["ES256"],
                    audience=audience,
                    options=decode_options
                )
                logger.info(f"Token verified successfully with key {try_kid} (kid in token: {kid})")
                return decoded
            except jwt.ExpiredSignatureError:
                raise
            except jwt.InvalidSignatureError:
                last_error = f"Signature verification failed with key {try_kid}"
                continue
            except jwt.InvalidTokenError as e:
                last_error = str(e)
                continue
        
        # If all keys failed, refresh keys and try once more
        logger.warning("All cached keys failed verification, refreshing keys...")
        try:
            keys = await self.fetch_keys()
            self._keys_cache = keys
            self._cache_timestamp = time.time()
            
            # Convert new keys to PEM
            self._public_keys = {}
            for new_kid, jwk in keys.items():
                try:
                    pem_key = self._convert_jwk_to_pem(jwk)
                    self._public_keys[new_kid] = pem_key
                except Exception as e:
                    logger.warning(f"Failed to convert key {new_kid} to PEM: {str(e)}")
            
            # Try again with refreshed keys
            for try_kid, public_key in self._public_keys.items():
                try:
                    decoded = jwt.decode(
                        token,
                        public_key,
                        algorithms=["ES256"],
                        audience=audience,
                        options=decode_options
                    )
                    logger.info(f"Token verified successfully with refreshed key {try_kid}")
                    return decoded
                except jwt.ExpiredSignatureError:
                    raise
                except jwt.InvalidSignatureError:
                    continue
                except jwt.InvalidTokenError:
                    continue
        except Exception as refresh_error:
            logger.error(f"Failed to refresh keys: {str(refresh_error)}")
        
        # All attempts failed
        raise jwt.InvalidTokenError(
            f"Token verification failed with all available keys. {last_error or 'No valid key found'}"
        )
    
    async def refresh_keys(self) -> None:
        """Force refresh of cached keys from JWKS endpoint."""
        logger.info("Forcing refresh of JWT signing keys...")
        keys = await self.fetch_keys()
        self._keys_cache = keys
        self._cache_timestamp = time.time()
        
        # Convert JWKs to PEM format
        self._public_keys = {}
        for kid, jwk in keys.items():
            try:
                pem_key = self._convert_jwk_to_pem(jwk)
                self._public_keys[kid] = pem_key
            except Exception as e:
                logger.warning(f"Failed to convert key {kid} to PEM: {str(e)}")
        
        logger.info(f"Refreshed {len(self._public_keys)} JWT signing keys")


# Global instance (singleton pattern)
_jwt_key_manager: Optional[JWKKeyManager] = None


def get_jwt_key_manager() -> JWKKeyManager:
    """
    Get or create the global JWT key manager instance.
    
    Returns:
        JWKKeyManager instance
    """
    global _jwt_key_manager
    
    if _jwt_key_manager is None:
        jwks_url = getattr(settings, 'SUPABASE_JWKS_URL', None)
        cache_ttl = getattr(settings, 'JWT_KEY_CACHE_TTL', 3600)
        _jwt_key_manager = JWKKeyManager(jwks_url=jwks_url, cache_ttl=cache_ttl)
    
    return _jwt_key_manager

