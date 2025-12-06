import json
from pathlib import Path

from base_agent import Agent

from ...models.summarizer.adapters.llama_cpp_adapter import LlamaCppAdapter

# This would change based on user settings (only english focused for now)
LOCALE = json.loads(Path("agents/localization/en.json").read_text())

class SummarizationAgent(Agent):
    
    AGENT_ID = "summarization"


    def __init__(self, provider_name, model_name):
        self._model_name = model_name
        self._provider_name = provider_name

        if(provider_name == "llama.cpp"):
            self.service_provider = LlamaCppAdapter(model_name)
        

    # Base Agent Required Properties:
    
    @property
    def id(self) -> str:
        return self.AGENT_ID

    @property
    def name(self) -> str:
        return LOCALE[self.AGENT_ID]["name"]

    @property
    def short_description(self) -> str:
        return LOCALE[self.AGENT_ID]["short_description"]

    @property
    def description(self) -> str:
        return LOCALE[self.AGENT_ID]["long_description"]

    @property
    def loading_message(self) -> str:
        return LOCALE[self.AGENT_ID]["loading_message"]


    # Provider + Model:

    @property
    def model_name(self) -> str:
        return self._model_name
        
    @property
    def provider_name(self) -> str:
        return self._provider_name

    def generate_streamed_summary(self, inputMessage: str):
        prompt = ""
        summarizedTranscript = self.service_provider.generate_streamed_summary(prompt, inputMessage)
        return summarizedTranscript



    