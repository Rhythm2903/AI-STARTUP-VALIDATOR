from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import google.generativeai as genai

app = FastAPI()

# Allow frontend to communicate smoothly during local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class BaselineInput(BaseModel):
    idea: str
    background: str
    location: str

class EvaluationInput(BaseModel):
    idea: str
    background: str
    location: str
    market_answer: str
    tech_answer: str
    finance_answer: str
    critique_answer: str

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

@app.get("/api/health")
def health():
    return {"status": "active", "key_configured": os.environ.get("GEMINI_API_KEY") is not None}

@app.post("/api/generate-questions")
async def generate_questions(data: BaselineInput):
    ai_model = get_gemini_client()
    
    # Error-Proof Fallback System
    if not ai_model:
        return {
            "market_question": f"For the market in {data.location}, who do you see as your immediate top competitor?",
            "tech_question": "What primary programming language or framework do you intend to build this core feature with?",
            "finance_question": "How much money do you estimate you need to launch a bare-minimum working prototype?",
            "critique_question": "What is the single biggest reason you think this idea might fail within its first month?"
        }
    
    prompt = f"""
    You are a panel of 4 startup experts analyzing a founder's initial idea.
    Founder Idea: {data.idea}
    Founder Background: {data.background}
    Target Location: {data.location}

    Each expert needs to ask ONE highly specific, critical, open-ended question to deeply evaluate this exact concept.
    
    Respond STRICTLY with a JSON object containing these keys:
    "market_question", "tech_question", "finance_question", "critique_question"
    """
    
    try:
        response = ai_model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate-idea")
async def evaluate_idea(data: EvaluationInput):
    ai_model = get_gemini_client()
    
    if not ai_model:
        return {
            "market_analysis": "Good localization choice. Demand looks steady based on background context.",
            "tech_analysis": "Feasible setup. Recommend starting with a monolithic architecture to save deployment costs.",
            "finance_analysis": "Bootstrapping is highly recommended here. Look into free tier tools first.",
            "critique_analysis": "The biggest risk is customer acquisition cost. Ensure an organic loop exists.",
            "roadmap": ["Build basic wireframe", "Launch landing page", "Collect first 20 beta users"]
        }
        
    prompt = f"""
    Analyze the full startup interview breakdown below:
    Context: Idea is '{data.idea}', target market is '{data.location}', founder background is '{data.background}'.
    
    Expert Follow-up Responses:
    - Market/Locational Answer: {data.market_answer}
    - Technical Feasibility Answer: {data.tech_answer}
    - Financial Model Answer: {data.finance_answer}
    - Critique/Risk Answer: {data.critique_answer}

    Provide an intensive diagnostic report across all 4 sectors, plus a 3-step action roadmap.
    Respond STRICTLY with a JSON object matching this schema exactly:
    {{
        "market_analysis": "string detailing local competition strategy",
        "tech_analysis": "string detailing tech stack efficiency advice",
        "finance_analysis": "string detailing monetization and unit economics",
        "critique_analysis": "string exposing hidden risks or fatal flaws",
        "roadmap": ["step 1 string", "step 2 string", "step 3 string"]
    }}
    """
    try:
        response = ai_model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))