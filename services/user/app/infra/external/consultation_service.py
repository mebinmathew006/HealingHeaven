import httpx
CONSULTATION_SERVICE_URL = "http://consultation-service:8001"

async def get_psycholgist_rating(psychologist_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{CONSULTATION_SERVICE_URL}/get_psycholgist_rating/{psychologist_id}")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTPX Request error: {e}")
        except httpx.HTTPStatusError as e:
            print(f" error in payment-service: {e}")
    return {}       