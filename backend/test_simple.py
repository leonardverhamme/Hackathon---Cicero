import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_openai():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
            json={
                "model": "gpt-5-2025-08-07",
                "messages": [{"role": "user", "content": "Say hello"}],
                "max_tokens": 10
            }
        )
        print("Status:", response.status_code)
        print("Response:", response.json())

import asyncio
asyncio.run(test_openai())
