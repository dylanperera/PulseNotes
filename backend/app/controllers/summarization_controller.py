from .base_controller import Controller
from ..services.summarization_service import SummarizationService
from fastapi import WebSocket

class SummarizationController(Controller):

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
    
    async def summarize_transcript(self, payload):

        raw_text: str = payload["raw_text"]
        prompt: str = payload["prompt"]
        provider_name: str = payload["service_name"]
        model_name: str = payload["model_name"]
        model_path: str = payload["model_path"]

        summarization_service = SummarizationService(provider_name, model_name, model_path)

        summary_stream = summarization_service.get_summary_generator_object(raw_text=raw_text, prompt=prompt)

        await self.websocket.send_json({"type":"summary_token_start", "payload":"start"})

        async for it in summary_stream:
            await self.websocket.send_json({"type":"summary_token", "payload":it})


        await self.websocket.send_json({"type":"summary_token_end", "payload":"stop"})


        

