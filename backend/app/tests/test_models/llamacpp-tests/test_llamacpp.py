import unittest
from llama_cpp import Llama
from app.utils.utils import get_model_path

class TestLlamaCPP(unittest.TestCase):

    TWO_MIN_CONVO = "2min_convo.txt"

    MEDI_PHI_CLINICAL_1 = "MediPhi-Clinical.i1-Q4_K_M.gguf"

    # Each test should test a model + x minute convo
    # We want to check that an output is produced, x context tokens for the output (n_ctx), and measure the time for each test
    # Get test data from actual sources -> Do more research on this

    def test_mediphi_2min_convo(self):
        ## Arrange 
        file = open(self.TWO_MIN_CONVO, "r")
        
        messages = [
            {"role": "system", "content": "Provide a one-paragraph clinical summary of the doctor-patient conversation."},
            {"role": "user", "content": file.read()}
        ]
        
        llm = Llama(
            model_path= str(get_model_path(self.MEDI_PHI_CLINICAL_1)),
            n_gpu_layers=-1,   
            n_threads=4,
            n_ctx=2048
        )

        ## Act
        result = llm.create_chat_completion(messages=messages)

        ## Assert
        summary = result["choices"][0]["message"]["content"]
        print("\n--- SUMMARY ---\n")
        print(summary)
        print("\n---------------\n")


if __name__ == "__main_":
    unittest.main()

