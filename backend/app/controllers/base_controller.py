from abc import ABC, abstractmethod
from fastapi import WebSocket


### This class represents the base class from which we will create the types of controllers (Transcribe, summarize, etc.,)

class Controller(ABC):

    async def connect_ws(self, websocket: WebSocket):
        await websocket.accept()

    def disconnect_ws(self, websocket: WebSocket):
       pass

