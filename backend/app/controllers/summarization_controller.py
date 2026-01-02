from .base_controller import Controller
from ..services.summarization_service import SummarizationService
from fastapi import WebSocket

class SummarizationController(Controller):

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
    
    async def summarize_transcript(self, raw_text: str, provider_name: str = "llama.cpp", model_name: str = "Llama-3.2-1B-Instruct-Q5_K_M.gguf"):

        summarization_service = SummarizationService(provider_name, model_name)

        summary_stream = summarization_service.get_summary_generator_object(raw_text=raw_text)

        await self.websocket.send_json({"type":"summary_token_start", "payload":"start"})

        async for it in summary_stream:
            await self.websocket.send_json({"type":"summary_token", "payload":it})


        await self.websocket.send_json({"type":"summary_token_end", "payload":"stop"})


        

