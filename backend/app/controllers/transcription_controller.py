import asyncio
from .base_controller import Controller
from fastapi import WebSocket
class TranscriptionController(Controller):
    def __init__(self, websocket: WebSocket, service):
        self.websocket = websocket
        self.service = service
        self.task: asyncio.Task | None = None

    async def start(self):
        self.service.start()
        self.task = asyncio.create_task(self._run())

    async def stop(self):
        self.service.stop()
        if self.task:
            self.task.cancel()

    async def _run(self):
        while True:
            self.service.process_audio()

            text = self.service.get_transcription()

            if text:
                await self.websocket.send_json({
                    "type": "transcription_update",
                    "payload": {
                        "text": text,
                        "final": False
                    }
                })

            await asyncio.sleep(0.05)
