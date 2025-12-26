import time
import unittest

from app.utils.utils import  get_test_data_path
from ...models.summarizer.adapters.llama_cpp_interface import LlamaCppInterface

class TestLlamaCPP(unittest.TestCase):

    FIRST_CONVO = "2min_convo.txt"
    SECOND_CONVO = "5min_convo.txt"
    THIRD_CONVO = "10min_convo.txt"
    FOURTH_CONVO = "15min_convo.txt"
    FIFTH_CONVO = "20min_convo.txt"

    MEDI_PHI_CLINICAL_1 = "MediPhi-Clinical.i1-Q4_K_S.gguf"
    
    LLAMA_1 = "Llama-3.2-1B-Instruct-Q5_K_M.gguf"
    LLAMA_2 = "Llama-3.2-1B-Instruct-Q4_K_M.gguf"


if __name__ == "__main__":
    unittest.main()



    