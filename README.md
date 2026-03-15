# StoryForge ✨
### AI-powered personalized storybooks for children

StoryForge uses Google Gemini to generate magical, personalized illustrated 
storybooks for children in seconds. Enter a child's name, age, and favorite 
theme — and watch a unique story come to life page by page.

## Features
- Personalized stories with the child as the hero
- 8 magical themes to choose from
- Real-time streaming — pages appear as they're written
- Beautiful storybook UI with page navigation
- Powered by Gemini 2.0 Flash

## Tech Stack
- Google Gemini 2.0 Flash
- Google GenAI SDK
- FastAPI (Python backend)
- React + Vite (frontend)
- Google Cloud Run (deployment)
- Server-Sent Events (real-time streaming)

## How to run locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API key from aistudio.google.com

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

Create a .env file in backend/ with:
GEMINI_API_KEY=your_key_here

uvicorn main:app --reload --port 8000

### Frontend
cd frontend
npm install
npm run dev

Open http://localhost:5173

## Architecture
User → React Frontend → FastAPI Backend → Gemini 2.0 Flash
                     ↓
              Google Cloud Run
              Google Cloud Storage