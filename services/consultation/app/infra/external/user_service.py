import httpx

USER_SERVICE_URL = "http://user-service:8000"

async def get_user_details(user_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{USER_SERVICE_URL}/get_user_details_by_id/{user_id}")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTPX Request error: {e}")
        except httpx.HTTPStatusError as e:
            print(f"User not found or error in user-service: {e}")
    return {}

async def get_minimal_user_details(user_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{USER_SERVICE_URL}/get_user_details_by_id/{user_id}")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTPX Request error: {e}")
        except httpx.HTTPStatusError as e:
            print(f"User not found or error in user-service: {e}")
    return {}

async def get_doctor_details(psychologist_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{USER_SERVICE_URL}/get_doctor_details_by_id/{psychologist_id}")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTPX Request error: {e}")
        except httpx.HTTPStatusError as e:
            print(f"User not found or error in user-service: {e}")
    return {}