"""User addresses routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.v1.deps import get_db, get_current_user, validate_uuid_param
from app.schemas.user import UserAddress, UserAddressCreate, UserAddressUpdate
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from supabase import Client

router = APIRouter(prefix="/users/me/addresses", tags=["Addresses"])


@router.get("", response_model=List[UserAddress])
@rate_limit("100/minute")
async def get_addresses(
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get user's addresses.
    
    Returns:
        List of user addresses
    """
    response = db.table("user_addresses").select("*").eq(
        "user_id", current_user.id
    ).order("is_default", desc=True).order("created_at", desc=True).execute()
    
    return [UserAddress(**addr) for addr in (response.data or [])]


@router.post("", response_model=UserAddress, status_code=201)
@rate_limit("20/hour")
async def create_address(
    address: UserAddressCreate,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Add a new address.
    
    Returns:
        Created address
    """
    # If this is set as default, unset other defaults
    if address.is_default:
        db.table("user_addresses").update({"is_default": False}).eq(
            "user_id", current_user.id
        ).execute()
    
    address_data = address.model_dump()
    address_data["user_id"] = current_user.id
    
    response = db.table("user_addresses").insert(address_data).execute()
    
    return UserAddress(**response.data[0])


@router.put("/{address_id}", response_model=UserAddress)
@rate_limit("60/minute")
async def update_address(
    address_id: str = Depends(validate_uuid_param),
    address_update: UserAddressUpdate = None,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update an address.
    
    Returns:
        Updated address
    """
    # Verify address belongs to user
    existing = db.table("user_addresses").select("*").eq(
        "id", address_id
    ).eq("user_id", current_user.id).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    # If setting as default, unset other defaults
    if address_update.is_default:
        db.table("user_addresses").update({"is_default": False}).eq(
            "user_id", current_user.id
        ).neq("id", address_id).execute()
    
    update_data = address_update.model_dump(exclude_unset=True)
    if update_data:
        response = db.table("user_addresses").update(update_data).eq(
            "id", address_id
        ).execute()
        
        return UserAddress(**response.data[0])
    
    return UserAddress(**existing.data[0])


@router.delete("/{address_id}", status_code=204)
@rate_limit("60/minute")
async def delete_address(
    address_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete an address.
    """
    # Verify address belongs to user
    existing = db.table("user_addresses").select("*").eq(
        "id", address_id
    ).eq("user_id", current_user.id).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    db.table("user_addresses").delete().eq("id", address_id).execute()

