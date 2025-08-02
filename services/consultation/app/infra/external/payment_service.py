import httpx
PAYMENT_SERVICE_URL = "http://payment-service:8002"

async def fetch_money_from_wallet(data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{PAYMENT_SERVICE_URL}/fetch_money_from_wallet",json=data)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTPX Request error: {e}")
        except httpx.HTTPStatusError as e:
            print(f" error in payment-service: {e}")
    return {}       

async def add_money_to_wallet(data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{PAYMENT_SERVICE_URL}/add_money_to_wallet",json=data)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTPX Request error: {e}")
        except httpx.HTTPStatusError as e:
            print(f" error in payment-service: {e}")
            
