import time
import unittest

from app.utils.utils import get_model_path, get_test_data_path, stream_response
from llama_cpp import Llama


class TestLlamaCPP(unittest.TestCase):

    FIRST_CONVO = "2min_convo.txt"
    SECOND_CONVO = "5min_convo.txt"
    THIRD_CONVO = "10min_convo.txt"
    FOURTH_CONVO = "15min_convo.txt"
    FIFTH_CONVO = "20min_convo.txt"

    MEDI_PHI_CLINICAL_1 = "MediPhi-Clinical.i1-Q4_K_S.gguf"

    DOLPHIN = "Dolphin3.0-Llama3.2-3B-q4_k_s.gguf"
    
    LLAMA_1 = "Llama-3.2-1B-Instruct-Q5_K_M.gguf"
    LLAMA_2 = "Llama-3.2-1B-Instruct-Q4_K_M.gguf"

    dolphin_prompt = """
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


    medi_prompt = """
                You are a clinical documentation assistant. Your job is to transform a doctor–patient conversation into a concise clinical SUMMARY and a structured SOAP note without adding or assuming medical information.

                Your output must strictly follow these rules:

                GENERAL RULES
                - Do NOT diagnose. Do NOT label conditions (e.g., “anxiety disorder,” “burnout,” “cardiomyopathy”).
                - Do NOT suggest tests, treatments, medications, referrals, follow-ups, or care plans unless the doctor explicitly mentioned them.
                - Do NOT invent vital signs, normal findings, abnormal findings, or physical exam results.
                - Do NOT add symptom severity or interpret causes.
                - Do NOT add medical explanations, mechanisms, or interpretations.
                - ONLY include information stated directly by the patient or doctor.

                SUMMARY (5–7 sentences)
                - Include the major symptoms, patterns, triggers, emotional factors, functional impacts, and key concerns.
                - Stay concise, clinical, and purely factual.
                - Do not use diagnostic language or medical reasoning.

                SOAP NOTE

                Subjective:
                - List ONLY patient-reported symptoms, patterns, emotional themes, sleep issues, stressors, context, and concerns.
                - No interpretation or diagnosis.

                Objective:
                - Only include objective findings explicitly mentioned by the doctor.
                - If none were provided, write: “No objective findings were discussed in this conversation.”

                Assessment:
                - Summarize the overall themes and patterns WITHOUT diagnosing.
                - Use phrasing like: “Based on the patient’s report, symptoms appear to occur during…” 
                - DO NOT give names of conditions or imply a diagnosis.
                - DO NOT recommend tests or treatments.

                Plan:
                - ONLY include plan items, advice, or next steps the doctor explicitly stated.
                - If no specific plan was discussed, write: “No specific plan was discussed in this conversation.”

                Your output must remain strictly factual, neutral, and faithful to the transcript at all times.

            """

    # Each test should test a model + x minute convo
    # We want to check that an output is produced, x context tokens for the output (n_ctx), and measure the time for each test
    
    def test_llama(self):

        ## Arrange 
        file = open(get_test_data_path(self.FIFTH_CONVO), "r")
        
        
        messages = [
            {
                "role": "system",
                "content": self.dolphin_prompt   # prompt
            },
            {
                "role": "user",
                "content": file.read()
            }
        ]

        file.close()
        
        llm = Llama(
            model_path= str(get_model_path(self.INTELECTA)),
            n_gpu_layers=-1,   
            n_threads=4,
            n_ctx = 4096,
        )

        ## Act
        start_time = time.time()
        response_stream = llm.create_chat_completion(
                                                        messages=messages,
                                                        temperature=0.0,                # NO creativity. Pure factual extraction.
                                                        top_p=0.9,                      # Keep sampling stable.
                                                        min_p=0.05,                     # Helps avoid weird token drops (q4 models)
                                                        top_k=40,                       # Good balance for small models.
                                                        repeat_penalty=1.05,            # Prevents looping without hurting accuracy.
                                                        max_tokens=1024,                # Plenty for summary + SOAP.
                                                        stream=True,                    # Good for UI.
                                                        stop=["</s>", "<|eot_id|>"],    # Important for Llama-style formatting.
                                                    )

        stream_response(response_stream)

        end_time = time.time()
        
        elapsed_time = end_time - start_time
        print(f"Model execution time: {elapsed_time:.4f} seconds")


        ## Assert

        self.assertLessEqual(elapsed_time, 10, "Model took more than 10 seconds to execute")

if __name__ == "__main__":
    unittest.main()



    