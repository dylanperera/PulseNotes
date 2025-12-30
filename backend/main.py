from fastapi import FastAPI, WebSocket
from app.controllers.summarization_controller import SummarizationController

app = FastAPI()


# Endpoint to summarize text
# Input: Transcript -> Given in one go
# Output: Summary -> Streamed back 
@app.websocket("/summarize")
async def summary_websocket(websocket: WebSocket):

    summarization_controller = SummarizationController(websocket)

    await summarization_controller.connect_ws(websocket)

    await summarization_controller.summarize_transcript()