from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
import json
import google.generativeai as genai

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents import (
    get_market_prompt, get_market_fallback,
    get_tech_prompt, get_tech_fallback,
    get_finance_prompt, get_finance_fallback,
    get_critique_prompt, get_critique_fallback
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return {
        "status": "active",
        "key_configured": os.environ.get("GEMINI_API_KEY") is not None
    }


@app.post("/api/generate-questions")
async def generate_questions(data: BaselineInput):
    ai_model = get_gemini_client()

    if not ai_model:
        return {
            "market_question": get_market_fallback(data.location),
            "tech_question": get_tech_fallback(),
            "finance_question": get_finance_fallback(),
            "critique_question": get_critique_fallback()
        }

    prompt = f"""
You are a panel of 4 startup experts analyzing a founder's idea.

{get_market_prompt(data.idea, data.background, data.location)}
{get_tech_prompt(data.idea, data.background)}
{get_finance_prompt(data.idea, data.background)}
{get_critique_prompt(data.idea, data.background, data.location)}

Respond ONLY with a valid JSON object with exactly these 4 keys:
"market_question", "tech_question", "finance_question", "critique_question"

Each value must be a single sharp question string. No preamble, no markdown, no extra keys.
"""

    try:
        response = ai_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        raw = response.text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return {
            "market_question": get_market_fallback(data.location),
            "tech_question": get_tech_fallback(),
            "finance_question": get_finance_fallback(),
            "critique_question": get_critique_fallback()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/evaluate-idea")
async def evaluate_idea(data: EvaluationInput):
    ai_model = get_gemini_client()

    if not ai_model:
        return {
            "market_analysis": "Solid market potential. Validate demand through 10 user interviews before building.",
            "tech_analysis": "Start monolithic. Avoid microservices until you hit real scaling pain.",
            "finance_analysis": "Bootstrap first. Focus on unit economics from day one.",
            "critique_analysis": "Biggest risk: building before validating. Talk to users first.",
            "roadmap": [
                "Interview 10 potential customers this week",
                "Build the simplest possible version in 2 weeks",
                "Get 5 paying users before writing more code"
            ],
            "scores": {"market": 7, "tech": 6, "finance": 6, "risk": 5}
        }

    prompt = f"""
You are a senior startup analyst delivering a final diagnostic report.

Startup: "{data.idea}"
Location: {data.location}
Founder Background: {data.background}

Expert Interview Responses:
- Market Answer: {data.market_answer}
- Technical Answer: {data.tech_answer}
- Financial Answer: {data.finance_answer}
- Risk/Critique Answer: {data.critique_answer}

Respond ONLY with a valid JSON object with exactly these keys:
{{
  "market_analysis": "2-3 sentence honest market assessment with actionable advice",
  "tech_analysis": "2-3 sentence technical feasibility assessment with specific recommendations",
  "finance_analysis": "2-3 sentence financial strategy assessment with concrete steps",
  "critique_analysis": "2-3 sentence critical risk assessment with mitigation advice",
  "roadmap": ["specific action step 1", "specific action step 2", "specific action step 3"],
  "scores": {{
    "market": <integer 1-10>,
    "tech": <integer 1-10>,
    "finance": <integer 1-10>,
    "risk": <integer 1-10 where 10 means lowest risk>
  }}
}}

Be honest, specific, and tactical. No generic advice. No markdown, no preamble.
"""

    try:
        response = ai_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))