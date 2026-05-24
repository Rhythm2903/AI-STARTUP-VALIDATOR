def get_critique_prompt(idea, background, location):
    return f"""
    You are The Challenger (Critique Agent acting as Devil's Advocate). Analyze this baseline:
    Idea: {idea}
    Founder Background: {background}
    Target Location: {location}

    Ask ONE direct, critical question exposing the single weakest assumption, operational risk, or hidden point of failure.
    """

def get_critique_fallback():
    return "What is the single biggest reason you think this project might fail within its first 3 months?"