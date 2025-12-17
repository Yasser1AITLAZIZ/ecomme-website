"""Test script to verify Edge Function is accessible."""
import httpx
import json
import asyncio
from app.config import settings

async def test_edge_function():
    """Test if the Edge Function is accessible."""
    edge_function_url = f"{settings.SUPABASE_URL}/functions/v1/send-order-confirmation"
    
    test_payload = {
        "order_id": "test-order-id",
        "order_number": "TEST-001",
        "customer_email": "test@example.com",
        "customer_name": "Test User",
        "items": [
            {
                "product_name": "Test Product",
                "quantity": 1,
                "price": 10.0
            }
        ],
        "subtotal": 10.0,
        "shipping_cost": 5.0,
        "discount_amount": 0.0,
        "total": 15.0,
        "currency": "MAD",
        "delivery_type": "delivery",
        "shipping_address": {
            "street": "123 Test St",
            "city": "Test City",
            "country": "Morocco"
        },
        "language": "fr"
    }
    
    print(f"Testing Edge Function: {edge_function_url}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                edge_function_url,
                json=test_payload,
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            print(f"\nStatus Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                print("\n✅ Edge Function is accessible!")
                return True
            else:
                print(f"\n❌ Edge Function returned error: {response.status_code}")
                return False
                
    except httpx.TimeoutException:
        print("\n❌ Timeout: Edge Function did not respond in time")
        return False
    except httpx.ConnectError:
        print(f"\n❌ Connection Error: Could not connect to {edge_function_url}")
        print("   Make sure the Edge Function is deployed to Supabase")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_edge_function())

