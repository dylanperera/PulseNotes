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

    prompt = """
        You are a clinical documentation assistant. Your job is to create a concise clinical SUMMARY and SOAP note based ONLY on what is stated in the conversation. You MUST NOT add, infer, or guess any medical details.

        STRICT RULES (DO NOT BREAK THESE):
        - Do NOT diagnose anything (no anxiety disorder, depression, cardiomyopathy, etc.).
        - Do NOT suggest or imply causes of symptoms.
        - Do NOT recommend treatments, coping strategies, lifestyle changes, or follow-up plans.
        - Do NOT add tests, referrals, or medical actions unless explicitly stated by the doctor.
        - Do NOT state or invent vital signs, normal results, abnormal results, or physical exam findings.
        - Do NOT expand the plan beyond what the doctor actually said.
        - Do NOT use terms like “should,” “needs to,” “likely,” “could indicate,” or similar inference language.

        ALLOWED:
        - ONLY describe what the patient and doctor explicitly said.
        - You MAY summarize patterns using neutral phrasing such as:
        “Based on the patient’s report…” 
        “Symptoms tend to occur during…”
        “The patient describes…”

        FORMAT REQUIREMENTS:

        SUMMARY (5–7 sentences):
        - Include major symptoms, patterns, triggers, emotional themes, sleep issues, stressors, and patient goals.
        - Keep it factual and clinically neutral.
        - DO NOT give interpretations or advice.

        SOAP NOTE:

        Subjective:
        - List ONLY patient-reported symptoms, stressors, emotional themes, sleep patterns, and concerns.
        - No interpretations.

        Objective:
        - ONLY include objective findings if explicitly spoken by the doctor.
        - If none were discussed, write: “No objective findings were discussed.”

        Assessment:
        - Summarize symptom patterns WITHOUT diagnosing or giving medical explanations.
        - Use ONLY neutral phrasing, e.g., “Based on the patient’s report, symptoms tend to occur during…”
        - Do NOT list any medical conditions.

        Plan:
        - ONLY include plan items explicitly stated by the doctor.
        - If the doctor did not provide specific next steps, write:
        “No specific plan was discussed in this conversation.”

        Your output MUST stay strictly faithful to the transcript with zero added content.
    """

    # Each test should test a model + x minute convo
    # We want to check that an output is produced, x context tokens for the output (n_ctx), and measure the time for each test
    
    def test_llama(self):

        ## Arrange 
        file = open(get_test_data_path(self.FIRST_CONVO), "r")

        ## Act
        start_time = time.time()

        llama_cpp_adapter = LlamaCppInterface(self.LLAMA_1)

        llama_cpp_adapter.generate_streamed_summary(self.prompt, file.read())
       
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        print(f"Model execution time: {elapsed_time:.4f} seconds")

        file.close()

        ## Assert
        self.assertLessEqual(elapsed_time, 10, "Model took more than 10 seconds to execute")

if __name__ == "__main__":
    unittest.main()



    