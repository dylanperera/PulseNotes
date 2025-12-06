import multiprocessing

from app.utils.utils import get_model_path, stream_response
from base_llm_interface import ModelInterface
from llama_cpp import Llama


class LlamaCppAdapter(ModelInterface):

    def __init__(self, model_name):
        self.num_threads = max(multiprocessing.cpu_count() // 2, 1)  # Use half the cores available

        # Select correct model given the model name from user

        self.llm = Llama(
            model_path= str(get_model_path(model_name)),
            n_gpu_layers=-1,        # Full Metal acceleration
            n_threads=self.num_threads,
            n_ctx=4096              # Context window
        )

    # Generate summary with no streaming
    def generate_summary(self, prompt: str, input: str):

        output = self._summarizeTranscript(prompt, input, False)
        
        stream_response(output)

    # Generate summary with streaming enabled
    def generate_streamed_summary(self, prompt: str, input: str):
        
        output = self._summarizeTranscript(prompt, input, True)

        stream_response(output)

    # Helpder method to summarize transcript
    def _summarizeTranscript(self, prompt: str, input: str, stream: bool):

        output = self.llm.create_chat_completion(messages=[prompt, input],
                                                 temperature=0.0,                # NO creativity. Pure factual extraction.
                                                 top_p=0.9,                      # Keep sampling stable.
                                                 min_p=0.05,                     # Helps avoid weird token drops (q4 models)
                                                 top_k=40,                       # Good balance for small models.
                                                 repeat_penalty=1.05,            # Prevents looping without hurting accuracy.
                                                 max_tokens=1024,                # Plenty for summary + SOAP.
                                                 stream=stream,
                                                 stop=["</s>", "<|eot_id|>"]    # Important for Llama-style formatting.
        )

        return output
