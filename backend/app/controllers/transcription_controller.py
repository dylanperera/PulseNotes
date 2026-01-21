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
            try:
                await self.task
            except asyncio.CancelledError:
                pass
            self.task = None


    async def pause(self):
        self.service.pause()

    async def resume(self):
        self.service.resume()

    async def _run(self):
        try:
            while True:
                self.service.process_audio()

                msg = self.service.get_transcription()
                if msg:
                    await self.websocket.send_json({
                        "type": "transcription_token",
                        "payload": msg
                    })

                await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            pass

