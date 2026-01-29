import logging
from .agents.summarization_agent import SummarizationAgent
from ..models.summarizer.adapters.llama_cpp_interface import LlamaCppInterface

logger = logging.getLogger(__name__)

class SummarizationService():
    """
    Coordinates the summarization process:
    - selects and initializes the LM provider/interface (via adapters)
    - creates the summarization agent
    - formats input transcripts
    - streams summary output
    """

    def __init__(self, provider_id:str, model_name:str):
        try:
            if not provider_id or not model_name:
                raise ValueError("Provider and model name required")
            
            if provider_id == "llama.cpp":
                self._model_interface = LlamaCppInterface(model_name)
            else:
                raise ValueError(f"Unknown provider: {provider_id}")

            self.summarization_agent = SummarizationAgent(self._model_interface, model_name)
            logger.info(f"SummarizationService initialized with {provider_id} provider")
        except Exception as e:
            logger.error(f"Failed to initialize SummarizationService: {e}")
            raise

    # Have a private method to distill/edit the incoming transcript - this would be like different slicing methods, etc., 
    def _format_input(self, raw_text):
        if not raw_text:
            raise ValueError("Input text cannot be empty")
        return raw_text.strip() if isinstance(raw_text, str) else raw_text

    # Get the summary generator object
    def get_summary_generator_object(self, raw_text: str, prompt: str = None):
        try:
            formatted_input = self._format_input(raw_text)
            summary_generator_object = self.summarization_agent.generator_function_get_next_token(prompt, formatted_input)
            return summary_generator_object
        except Exception as e:
            logger.error(f"Failed to generate summary: {e}")
            raise

    