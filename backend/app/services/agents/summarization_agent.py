import asyncio
import json
import logging
from pathlib import Path

from .base_agent import Agent

from ...models.summarizer.adapters.base_llm_interface import ModelInterface

logger = logging.getLogger(__name__)

# This would change based on user settings (only english focused for now)
# LOCALE = json.loads(Path("agents/localization/en.json").read_text())

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

    def _generate_prompt(self, prompt:str=None) -> str:
        if(prompt == None):
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
        
        return prompt

    async def generator_function_get_next_token(self, prompt:str, formatted_input: str):
        try:
            # Get token from the transcript
            prompt = self._generate_prompt(prompt)
            response_stream = self._model_interface.generate_streamed_summary(prompt, formatted_input)

            for chunk in response_stream:
                token = None

                # llama.cpp streaming formats
                token = (
                    chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                   # or chunk.get("choices", [{}])[0].get("text")
                   # or chunk.get("token", {}).get("text")
                )

                if not token:
                    continue

                yield token

                # Allow for loop flushing - this is so the text appears as a stream on the front-end
                await asyncio.sleep(0)
        except Exception as e:
            logger.error(f"Error generating tokens: {e}")
            raise
        
        


    