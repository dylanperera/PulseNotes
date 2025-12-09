import json
from pathlib import Path

from base_agent import Agent

from ...models.summarizer.adapters.base_llm_interface import ModelInterface

# This would change based on user settings (only english focused for now)
LOCALE = json.loads(Path("agents/localization/en.json").read_text())

class SummarizationAgent(Agent):
    
    AGENT_ID = "summarization"


    def __init__(self, provider_id: str, model_name: str, model_interface: ModelInterface):
        self._model_name = model_name
        self._provider_id = provider_id
        self._model_interface = model_interface
        

    # Base Agent Required Properties:
    
    @property
    def id(self) -> str: return self.AGENT_ID

    @property
    def name(self) -> str: return LOCALE[self.AGENT_ID]["name"]

    @property
    def short_description(self) -> str: return LOCALE[self.AGENT_ID]["short_description"]

    @property
    def description(self) -> str: return LOCALE[self.AGENT_ID]["long_description"]

    @property
    def loading_message(self) -> str: return LOCALE[self.AGENT_ID]["loading_message"]


    # Provider + Model:

    @property
    def model_name(self) -> str: return self._model_name
        
    @property
    def provider_id(self) -> str: return self._provider_id

    # Summarization Agent functions
    def generate_streamed_summary(self, inputMessage: str):
        prompt = ""
        summarizedTranscript = self._model_interface.generate_streamed_summary(prompt, inputMessage)
        return summarizedTranscript



    