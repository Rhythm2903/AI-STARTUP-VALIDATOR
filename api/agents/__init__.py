from .market_agent import get_market_prompt, get_market_fallback
from .tech_agent import get_tech_prompt, get_tech_fallback
from .finance_agent import get_finance_prompt, get_finance_fallback
from .critique_agent import get_critique_prompt, get_critique_fallback

# Expose the functions cleanly at the package level
__all__ = [
    "get_market_prompt", "get_market_fallback",
    "get_tech_prompt", "get_tech_fallback",
    "get_finance_prompt", "get_finance_fallback",
    "get_critique_prompt", "get_critique_fallback"
]