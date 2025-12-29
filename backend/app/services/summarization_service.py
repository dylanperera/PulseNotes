from .agents.summarization_agent import SummarizationAgent
from ..models.summarizer.adapters.llama_cpp_interface import LlamaCppInterface

class SummarizationService():
    """
    Coordinates the summarization process:
    - selects and initializes the LM provider/interface (via adapters)
    - creates the summarization agent
    - formats input transcripts
    - streams summary output
    """

    def __init__(self, provider_id:str, model_name:str):
        
        if(provider_id == "llama.cpp"):
            self._model_interface = LlamaCppInterface(model_name)
        else:
            #throw error
            pass

        self.summarization_agent = SummarizationAgent(self._model_interface, model_name)

    # Have a private method to distill/edit the incoming transcript - this would be like different slicing methods, etc., 
    def _format_input(self, raw_text):
        return raw_text


    # Get the summary generator object
    def get_summary_generator_object(self, raw_text: str, prompt: str = None):
        formatted_input = self._format_input(raw_text)
        summary_generator_object = self.summarization_agent.generator_function_get_next_token(prompt, formatted_input)
        return summary_generator_object

    