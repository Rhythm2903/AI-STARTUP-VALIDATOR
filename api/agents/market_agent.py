def get_market_prompt(idea, background, location):
    return f"""
    You are a Market & Localization Startup Expert. Analyze this baseline:
    Idea: {idea}
    Founder Background: {background}
    Target Location: {location}

    Ask ONE highly specific, open-ended question evaluating local competition, regional target demographics, or market size validation.
    """

def get_market_fallback(location):
    return f"For the market in {location}, who do you see as your immediate top competitor?"