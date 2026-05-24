def get_finance_prompt(idea, background):
    return f"""
    You are a Financial & Business Model Expert. Analyze this baseline:
    Idea: {idea}
    Founder Background: {background}

    Ask ONE highly specific, open-ended question focused on low-cost user acquisition channels, bootstrapping budgets, or unit economics scalability.
    """

def get_finance_fallback():
    return "How do you plan to acquire your first 50 users without a marketing budget?"