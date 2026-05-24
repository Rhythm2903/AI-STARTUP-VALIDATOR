def get_tech_prompt(idea, background):
    return f"""
    You are a Technical Feasibility Expert. Analyze this baseline:
    Idea: {idea}
    Founder Background: {background}

    Ask ONE highly specific, open-ended question targeting the tech stack complexity, development timeline bottlenecks, or MVP architectural requirements.
    """

def get_tech_fallback():
    return "What primary programming language or framework do you intend to build this core feature with?"