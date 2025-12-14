"""Internationalization utilities."""
from typing import Optional
from app.core.messages import MESSAGES

# Supported languages
SUPPORTED_LANGUAGES = ["en", "fr", "ar"]
DEFAULT_LANGUAGE = "en"


def get_language_from_header(accept_language: Optional[str]) -> str:
    """
    Extract language code from Accept-Language header.
    
    Args:
        accept_language: Accept-Language header value (e.g., "en-US,en;q=0.9,fr;q=0.8")
    
    Returns:
        Language code (en, fr, ar) or default if not supported
    """
    if not accept_language:
        return DEFAULT_LANGUAGE
    
    # Parse Accept-Language header
    # Format: "en-US,en;q=0.9,fr;q=0.8"
    languages = []
    for lang_part in accept_language.split(","):
        lang_part = lang_part.strip()
        if ";" in lang_part:
            lang_code = lang_part.split(";")[0].strip()
        else:
            lang_code = lang_part.strip()
        
        # Extract base language (e.g., "en" from "en-US")
        base_lang = lang_code.split("-")[0].lower()
        if base_lang in SUPPORTED_LANGUAGES:
            languages.append(base_lang)
    
    # Return first supported language or default
    return languages[0] if languages else DEFAULT_LANGUAGE


def t(key: str, lang: str = DEFAULT_LANGUAGE, **kwargs) -> str:
    """
    Translate a message key to the specified language.
    
    Args:
        key: Message key from MESSAGES dictionary
        lang: Language code (en, fr, ar)
        **kwargs: Format arguments for message (e.g., email="user@example.com")
    
    Returns:
        Translated message string
    """
    # Ensure language is supported, fallback to default
    if lang not in SUPPORTED_LANGUAGES:
        lang = DEFAULT_LANGUAGE
    
    # Get message for the language, fallback to English if key not found
    message = MESSAGES.get(lang, MESSAGES[DEFAULT_LANGUAGE]).get(
        key,
        MESSAGES[DEFAULT_LANGUAGE].get(key, key)  # Fallback to key itself if not found
    )
    
    # Format message with kwargs if provided
    if kwargs:
        try:
            message = message.format(**kwargs)
        except KeyError:
            # If formatting fails, return message as-is
            pass
    
    return message

