from app.controllers.transcription_controller import TranscriptionController
from app.services.transcription_service import TranscriptionService
from app.models.asr.adapters.pywhispercpp_adapter import PyWhisperCppAdapter
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from app.controllers.summarization_controller import SummarizationController
from app.controllers.model_controller import ModelController
from app.dtos.model_availability_dto import ModelAvailabilityDTO
from app.dtos.success_dto import SuccessDTO
from app.dtos.error_dto import ErrorDTO
from app.enums.ErrorMessageEnum import ErrorMessage

app = FastAPI()


# Generic websocket endpoint
@app.websocket("/ws")
async def web_socket_endpoint(websocket: WebSocket):

    try:

        await websocket.accept()

        summarization_controller = SummarizationController(websocket)

        transcription_service = TranscriptionService(
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
                print("recieved start transcription message from frontend")
                await transcription_controller.start()

            elif msg_type == "stop_transcription":
                print("recieved stop transcription from the frontend")
                await transcription_controller.stop()

            elif msg_type == "resume_transcription":
                print("resuming transcription")
                await transcription_controller.resume()

            elif msg_type == "pause_transcription":
                print("pausing transcription")
                await transcription_controller.pause()

            elif msg_type == "transcription_chunk":
                await summarization_controller.summarize_transcript(msg["payload"])


            elif msg_type == "close":
                break

            else:
                pass # Should handle this error

    except WebSocketDisconnect:
        print("WebSocket disconnected")


    await websocket.close()

@app.get('/models/', response_model=SuccessDTO) 
async def get_models(path: str = "/"):

    model_controller = ModelController()

    result: SuccessDTO | ErrorDTO = model_controller.get_models_status(path)

    if(isinstance(result, ErrorDTO)):
        raise HTTPException(status_code=result.status_code, detail=result.model_dump())
    
    return result


@app.get("/models/download/", response_model=SuccessDTO)
async def download_model(model_name: str = "", path: str = "/"):

    model_controller = ModelController()
    result: SuccessDTO | ErrorDTO = model_controller.download_new_model(path, model_name)

    if(isinstance(result, ErrorDTO)):
        raise HTTPException(status_code=result.status_code, detail=result.model_dump())
    
    return result



