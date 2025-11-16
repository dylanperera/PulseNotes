from base_agent import Agent
import json
from pathlib import Path

# This would change based on user settings (only english focused for now)
LOCALE = json.loads(Path("agents/localization/en.json").read_text())

class SummarizationAgent(Agent):
    
    AGENT_ID = "summarization"
    #TEXT_WORD_LIMIT = 0
    
    def __init__(self, model_name):
        self.model_name = model_name

    # Type of Agent
    @property
    def id(self):
        return self.AGENT_ID

    # Name of Agent
    @property
    def name(self):
        LOCALE[self.AGENT_ID].name

    # Short description of Agent
    @property
    def short_description(self):
        LOCALE[self.AGENT_ID].short_description
    
    # Long description of Agent
    @property
    def description(self):
        LOCALE[self.AGENT_ID].long_description

    
    # Get name of model being used
    @property
    def model_name(self) -> str:
        return self.model_name

    # Optional default loading message when processing/completing task
    @property
    def loading_message(self):
        return LOCALE[self.AGENT_ID].loading_message