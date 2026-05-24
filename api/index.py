from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import google.generativeai as genai

# Clean package-level import powered by your __init__.py file
from agents import (
    get_market_prompt, get_market_fallback,
    get_tech_prompt, get_tech_fallback,
    get_finance_prompt, get_finance_fallback,
    get_critique_prompt, get_critique_fallback
)

app = FastAPI()
# Rest of your FastAPI configuration stays exactly the same...