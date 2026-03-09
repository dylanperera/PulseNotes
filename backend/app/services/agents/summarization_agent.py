import asyncio
import json
import logging
from pathlib import Path

from .base_agent import Agent

from ...models.summarizer.adapters.base_llm_interface import ModelInterface

logger = logging.getLogger(__name__)

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

    async def generator_function_get_next_token(self, prompt:str, formatted_input: str):
        try:
            # Get token from the transcript
            response_stream = self._model_interface.generate_streamed_summary(prompt, formatted_input)

            for chunk in response_stream:
                token = None

                # llama.cpp streaming formats
                token = (
                    chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                   or chunk.get("choices", [{}])[0].get("text")
                   or chunk.get("token", {}).get("text")
                )

                if not token:
                    continue

                yield token

                # Allow for loop flushing - this is so the text appears as a stream on the front-end
                await asyncio.sleep(0)
        except Exception as e:
            logger.error(f"Error generating tokens: {e}")
            raise
        
    
        


    