"""Supabase client initialization.

This module follows the official Supabase Python documentation:
https://supabase.com/docs/reference/python/initializing
"""
from supabase import create_client, Client
from supabase.client import ClientOptions
from app.config import settings


def get_supabase_client() -> Client:
    """Get Supabase client with service role key for admin operations.
    
    Follows official Supabase Python initialization pattern:
    https://supabase.com/docs/reference/python/initializing
    
    Returns:
        Client: Supabase client configured with service role key
    """
    options = ClientOptions(
        postgrest_client_timeout=settings.SUPABASE_POSTGREST_TIMEOUT,
        storage_client_timeout=settings.SUPABASE_STORAGE_TIMEOUT,
        schema=settings.SUPABASE_SCHEMA,
    )
    
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
        options=options
    )


def get_supabase_client_anon() -> Client:
    """Get Supabase client with anon key for user operations.
    
    Follows official Supabase Python initialization pattern:
    https://supabase.com/docs/reference/python/initializing
    
    Returns:
        Client: Supabase client configured with anon key
    """
    options = ClientOptions(
        postgrest_client_timeout=settings.SUPABASE_POSTGREST_TIMEOUT,
        storage_client_timeout=settings.SUPABASE_STORAGE_TIMEOUT,
        schema=settings.SUPABASE_SCHEMA,
    )
    
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY,
        options=options
    )

