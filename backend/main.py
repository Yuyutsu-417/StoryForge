from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
import asyncio
import requests
import base64

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://storyforge.app",
    "X-Title": "StoryForge"
}

print(f"KEY LOADED: {OPENROUTER_API_KEY[:10] if OPENROUTER_API_KEY else 'NOT FOUND'}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StoryRequest(BaseModel):
    child_name: str
    age: int
    theme: str
    num_pages: int = 5

def build_prompt(req: StoryRequest) -> str:
    return f"""You are a creative children's storybook author.

Create a {req.num_pages}-page storybook for a child named {req.child_name} who is {req.age} years old.
The story theme is: {req.theme}

For EACH page, respond with a JSON object on a single line:
{{"page": 1, "text": "story text...", "image_prompt": "illustration description..."}}

Rules:
- One JSON line per page, nothing else
- Story text: 2-3 warm engaging sentences for age {req.age}
- Make {req.child_name} the hero
- Magical, fun, age appropriate
- image_prompt: detailed, colorful, children's book watercolor style
- Output ONLY the JSON lines, no extra text"""

def generate_story_text(req: StoryRequest):
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=HEADERS,
        json={
            "model": "google/gemini-2.0-flash-001",
            "messages": [
                {"role": "user", "content": build_prompt(req)}
            ],
            "temperature": 0.9,
            "max_tokens": 1300,
        }
    )
    data = response.json()
    print(f"STORY API: {json.dumps(data)[:500]}")
    if "choices" not in data:
        raise Exception(f"API error: {data}")
    return data["choices"][0]["message"]["content"].strip()

def generate_image(image_prompt: str) -> str:
    try:
        seed = abs(hash(image_prompt)) % 1000
        url = f"https://picsum.photos/seed/{seed}/512/512"
        response = requests.get(url, timeout=15, allow_redirects=True)
        if response.status_code == 200:
            image_data = base64.b64encode(response.content).decode('utf-8')
            return f"data:image/jpeg;base64,{image_data}"
        else:
            print(f"Picsum status: {response.status_code}")
    except Exception as e:
        print(f"Image generation error: {e}")
    return None

async def story_stream(req: StoryRequest):
    try:
        yield f"data: {json.dumps({'type': 'start', 'message': 'Creating your magical story...'})}\n\n"
        await asyncio.sleep(0.3)

        # Step 1: Generate story text
        raw_text = await asyncio.to_thread(generate_story_text, req)
        print(f"Raw response: {raw_text[:300]}")

        lines = [l.strip() for l in raw_text.split('\n') if l.strip()]

        pages = []
        for line in lines:
            if '{' in line and '}' in line:
                start = line.index('{')
                end = line.rindex('}') + 1
                json_str = line[start:end]
                try:
                    page_data = json.loads(json_str)
                    if page_data.get("text"):
                        pages.append(page_data)
                        yield f"data: {json.dumps({'type': 'page_text', 'page': page_data['page'], 'text': page_data['text']})}\n\n"
                        await asyncio.sleep(0.2)
                except json.JSONDecodeError:
                    continue

        # Step 2: Generate images one by one
        for page_data in pages:
            image_prompt = page_data.get("image_prompt", "")
            page_num = page_data.get("page", 1)

            try:
                image_data = await asyncio.wait_for(
                    asyncio.to_thread(generate_image, image_prompt),
                    timeout=25.0
                )
            except asyncio.TimeoutError:
                image_data = None

            yield f"data: {json.dumps({'type': 'page_image', 'page': page_num, 'image': image_data})}\n\n"
            await asyncio.sleep(0.2)

        yield f"data: {json.dumps({'type': 'complete', 'message': 'Your story is ready!'})}\n\n"

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

@app.post("/generate-story")
async def generate_story(req: StoryRequest):
    return StreamingResponse(
        story_stream(req),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/health")
async def health():
    return {"status": "ok", "message": "StoryForge backend is running"}