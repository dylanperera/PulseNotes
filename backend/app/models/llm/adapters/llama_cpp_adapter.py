from base_llm_interface import ModelInterface
from llama_cpp import Llama
import multiprocessing
from app.utils.utils import get_model_path

class LlamaCppAdapter(ModelInterface):

    def __init__(self, model_name):
        self.num_threads = max(multiprocessing.cpu_count() // 2, 1)  # Use half the cores available

        self.llm = Llama(
            model_path= str(get_model_path(model_name)),
            n_gpu_layers=-1,        # Full Metal acceleration
            n_threads=self.num_threads,
            n_ctx=2048              # Context window
        )

    def generateSummary(self, prompt: str, input: str):
        output = self.llm.create_chat_completion(messages=[prompt, input])
        summary = output["choices"][0]["message"]["content"]
        print(summary)