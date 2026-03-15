from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
import asyncio
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

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
- Output ONLY the JSON lines, no extra text"""

async def story_stream(req: StoryRequest):
    try:
        yield f"data: {json.dumps({'type': 'start', 'message': 'Creating your magical story...'})}\n\n"
        await asyncio.sleep(0.5)

        prompt = build_prompt(req)

        response = await asyncio.to_thread(
            lambda: client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.9,
                    max_output_tokens=2048,
                )
            )
        )

        raw_text = response.text.strip()
        print(f"Raw response: {raw_text[:300]}")

        lines = [l.strip() for l in raw_text.split('\n') if l.strip()]

        pages_found = 0
        for line in lines:
            if '{' in line and '}' in line:
                start = line.index('{')
                end = line.rindex('}') + 1
                json_str = line[start:end]
                try:
                    page_data = json.loads(json_str)
                    page_num = page_data.get("page", pages_found + 1)
                    page_text = page_data.get("text", "")

                    if page_text:
                        pages_found += 1
                        yield f"data: {json.dumps({'type': 'page_text', 'page': page_num, 'text': page_text})}\n\n"
                        await asyncio.sleep(0.3)
                        yield f"data: {json.dumps({'type': 'page_image', 'page': page_num, 'image': None})}\n\n"
                        await asyncio.sleep(0.1)

                except json.JSONDecodeError:
                    continue

        if pages_found == 0:
            yield f"data: {json.dumps({'type': 'error', 'message': 'No pages generated, please try again'})}\n\n"
            return

        yield f"data: {json.dumps({'type': 'complete', 'message': 'Your story is ready!'})}\n\n"

    except Exception as e:
        print(f"Error: {e}")
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