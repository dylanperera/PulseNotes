import unittest
from llama_cpp import Llama
from app.utils.utils import get_model_path, get_test_data_path, stream_response
import time

class TestLlamaCPP(unittest.TestCase):

    FIRST_CONVO = "2min_convo.txt"
    SECOND_CONVO = "5min_convo.txt"
    THIRD_CONVO = "10min_convo.txt"
    FOURTH_CONVO = "15min_convo.txt"
    FIFTH_CONVO = "20min_convo.txt"

    MEDI_PHI_CLINICAL_1 = "MediPhi-Clinical.i1-Q4_K_M.gguf"
    MEDI_PHI_CLINICAL_2 = "MediPhi-Clinical.i1-IQ1_S.gguf"
    LLAMA_1 = "Llama-3.2-1B-GGUF-QX.Q4_K_M.gguf"
    LLAMA_2 = "Llama-3.2-1B-Instruct-Q5_K_L.gguf"
    LLAMA_3 = "Llama-3.2-1B-Instruct-Q5_K_M.gguf"
    LLAMA_4 = "Llama-3.2-1B-Instruct-Q4_K_M.gguf"
    

    prompt = """
                You are a clinical documentation assistant. 
                Your task is to take a raw doctor-patient conversation transcript and produce:

                1. A structured SOAP note (Subjective, Objective, Assessment, Plan)

                Follow these rules:
                - DO NOT add new information. Only restructure what the summary states.
                - Do NOT hallucinate diagnoses, symptoms, medications, or timelines.
                - Keep language clear, neutral, and clinical.
                - Organize SOAP sections with bullet points when appropriate.
            """

    prompt1 =  """
                You are Model 1 of a clinical documentation assistant.

                Task:
                - Convert the raw doctor–patient transcript into a THOROUGH factual summary .
                - Capture symptoms, history elements, concerns, clinician actions, and follow-ups.

                Rules:
                - ONLY use information explicitly stated in the transcript.
                - Do NOT infer or guess symptoms, diagnoses, medications, or timelines.
                - Keep language neutral, clinical, and purely descriptive.

            """

    prompt2 =  """
                You are Model 2 of a clinical documentation assistant.

                You are given a summary produced from a transcript by Model 1. 
                Using ONLY the information in that summary, produce:

                1. A more medically oriented condensed summary (2–4 sentences).
                2. A SOAP note:
                - Subjective
                - Objective
                - Assessment (symptom-based, no diagnostic assumptions)
                - Plan (only if explicitly referenced)

                Rules:
                - DO NOT add any new clinical information.
                - DO NOT infer diagnoses, conditions, medications, or timelines.
                - Keep language clear, neutral, and clinical.
                - Use bullet points when appropriate.
            """

    # Each test should test a model + x minute convo
    # We want to check that an output is produced, x context tokens for the output (n_ctx), and measure the time for each test
    
    # def test_mediphi_2_2min_convo(self):

    #     """
    #     Test medi-phi clinical i1-Q4_O with a 2 minute conversation
    #     """

    #     ## Arrange 
    #     file = open(get_test_data_path(self.FIFTH_CONVO), "r")
        
        
    #     messages = [
    #         {"role": "system", "content": self.prompt},
    #         {"role": "user", "content": file.read()}
    #     ]

    #     file.close()
        
    #     llm = Llama(
    #         model_path= str(get_model_path(self.LLAMA_2)),
    #         n_gpu_layers=-1,   
    #         n_threads=4,
    #         n_ctx=8192
    #     )

    #     ## Act
    #     start_time = time.time()
    #     response_stream = llm.create_chat_completion(messages=messages, stream=True)
    #     end_time = time.time()
        
    #     elapsed_time = end_time - start_time
    #     print(f"Model execution time: {elapsed_time:.4f} seconds")
    #     stream_response(response_stream)
    #     print()


    #     ## Assert

    #     self.assertLessEqual(elapsed_time, 10, "Model took more than 10 seconds to execute")

    def test_llama_and_mediphi_convo(self):

        """
        Test llama + medi-phi combo
        Make a summary using llama then pass to Mediphi to make summary + SOAP Notes
        """

        ## Arrange 
        file = open(get_test_data_path(self.THIRD_CONVO), "r")
        
        
        messages1 = [
            {"role": "system", "content": self.prompt1},
            {"role": "user", "content": file.read()}
        ]

        file.close()
        
        llm1 = Llama(
            model_path= str(get_model_path(self.LLAMA_3)),
            n_gpu_layers=-1,   
            n_threads=8,
            n_ctx=5000
        )

        llm2 = Llama(
            model_path= str(get_model_path(self.MEDI_PHI_CLINICAL_1)),
            n_gpu_layers=-1,   
            n_threads=8,
            n_ctx=2048
        )

        ## Act
        start_time = time.time()
        response1 = llm1.create_chat_completion(messages=messages1)['choices'][0]['message']['content']

        print("RESPONSE:\n", response1)

        end_time = time.time()

        elapsed_time = end_time - start_time
        print(f"Model 1 execution time: {elapsed_time:.4f} seconds")
        

        messages2 = [
            {"role": "system", "content": self.prompt2},
            {"role": "user", "content": response1}
        ]

        

        response_stream = llm2.create_chat_completion(messages=messages2, stream=True)        

        stream_response(response_stream)
        print()


        ## Assert

        self.assertLessEqual(elapsed_time, 10, "Model took more than 10 seconds to execute")


        


if __name__ == "__main_":
    unittest.main()

