import json
from pathlib import Path

from base_agent import Agent

from ...models.summarizer.adapters.base_llm_interface import ModelInterface

# This would change based on user settings (only english focused for now)
# LOCALE = json.loads(Path("agents/localization/en.json").read_text())

class SummarizationAgent(Agent):
    
    AGENT_ID = "summarization"

    def __init__(self, model_interface:ModelInterface, model_name:str, prompt:str=None):
        self._model_interface = model_interface
        self._model_name = model_name
        
        
    # Base Agent Required Properties:
    @property
    def id(self) -> str: return self.AGENT_ID

    @property
    def name(self) -> str: return "Summarization Agent"

    @property
    def short_description(self) -> str: return "Generates structured clinical summaries."

    @property
    def description(self) -> str: return "Generates structured clinical summaries given the transcript between doctor and patient"

    @property
    def loading_message(self) -> str: return "Generating Summary..."


    # Summarization Agent functions

    def _generate_prompt(self, prompt:str=None) -> str:
        if(prompt == None):
            # select and return a Jinja prompt
            pass
        
        return prompt

    def generate_streamed_summary(self, formatted_input: str, prompt: str):
        prompt = self._generate_prompt(prompt)
        summarizedTranscript = self._model_interface.generate_streamed_summary(prompt, formatted_input)
        return summarizedTranscript



    