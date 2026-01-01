from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.controllers.summarization_controller import SummarizationController

app = FastAPI()


# Generic websocket endpoint
@app.websocket("/ws")
async def web_socket_endpoint(websocket: WebSocket):

    try:

        await websocket.accept()

        summarization_controller = SummarizationController(websocket)

        while True:
            msg = await websocket.receive_json()
            msg_type = msg["type"]

            if msg_type == "transcription_chunk":
                await summarization_controller.summarize_transcript(msg["payload"])

            elif msg_type == "close":
                break

            else:
                pass # Should handle this error

    except WebSocketDisconnect:
        print("WebSocket disconnected")

    
    await websocket.close()