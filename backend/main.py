from backend.app.controllers.transcription_controller import TranscriptionController
from backend.app.services.transcription_service import TranscriptionService
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.controllers.summarization_controller import SummarizationController

app = FastAPI()


# Generic websocket endpoint
@app.websocket("/ws")
async def web_socket_endpoint(websocket: WebSocket):

    try:

        await websocket.accept()

        summarization_controller = SummarizationController(websocket)
        transcription_service = TranscriptionService(
            adapter=PyWhisperCppAdapter(model="small"),
            asr_model="whispercpp"
        )

        transcription_controller = TranscriptionController(
            websocket=websocket,
            service=transcription_service
        )

        while True:
            msg = await websocket.receive_json()
            msg_type = msg["type"]

            # add something for audio input
            if msg_type == "start_transcription":
                await transcription_controller.start()

            elif msg_type == "stop_transcription":
                await transcription_controller.stop()

            if msg_type == "transcription_chunk":
                await summarization_controller.summarize_transcript(msg["payload"])


            elif msg_type == "close":
                break

            else:
                pass # Should handle this error

    except WebSocketDisconnect:
        print("WebSocket disconnected")


    await websocket.close()