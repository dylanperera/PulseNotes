from app.controllers.transcription_controller import TranscriptionController
from app.services.transcription_service import TranscriptionService
from app.services.audio.audio_capture_service import AudioCapture
from app.models.asr.adapters.pywhispercpp_adapter import PyWhisperCppAdapter
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from app.controllers.summarization_controller import SummarizationController
from app.controllers.model_controller import ModelController
from app.dtos.model_availability_dto import ModelAvailabilityDTO
from app.dtos.success_dto import SuccessDTO
from app.dtos.error_dto import ErrorDTO
from fastapi.middleware.cors import CORSMiddleware
from app.enums.ErrorMessageEnum import ErrorMessage
from huggingface_hub import login
import os
from app.registry.model_registry import MODEL_REGISTRY

app = FastAPI()

app.add_middleware(CORSMiddleware,
                   allow_credentials=False,
                   allow_origins=["*"],
                   allow_methods=["*"],
                   allow_headers=["*"])

login(os.getenv("HF_TOKEN"))

# Generic websocket endpoint
@app.websocket("/ws")
async def web_socket_endpoint(websocket: WebSocket):

    try:

        await websocket.accept()

        summarization_controller = SummarizationController(websocket)

        transcription_controller = None

        while True:
            msg = await websocket.receive_json()
            msg_type = msg["type"]

            # add something for audio input
            if msg_type == "start_transcription":
                print("recieved start transcription message from frontend")
                model = msg.get("model", "small")  # default to small if not provided
                device_id = msg.get("device_id", None)  # get microphone device id (None = default)
                valid_models = ["tiny", "base", "small", "medium", "large"]
                if model not in valid_models:
                    await websocket.send_json({"type": "error", "message": f"Invalid model: {model}. Valid models: {valid_models}"})
                    continue
                transcription_service = TranscriptionService(
                    asr_model="whispercpp",
                    transcription_model=model,
                    device_id=device_id
                )
                transcription_controller = TranscriptionController(
                    websocket=websocket,
                    service=transcription_service
                )
                await transcription_controller.start()

            elif msg_type == "stop_transcription":
                print("recieved stop transcription from the frontend")
                if transcription_controller:
                    await transcription_controller.stop()
                    transcription_controller = None

            elif msg_type == "resume_transcription":
                print("resuming transcription")
                if transcription_controller:
                    await transcription_controller.resume()

            elif msg_type == "pause_transcription":
                print("pausing transcription")
                if transcription_controller:
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

@app.get('/audio-devices')
async def get_audio_devices():
    """Get list of available audio input devices"""
    try:
        devices = AudioCapture.get_available_devices()
        return SuccessDTO(
            result=devices,
            status_code=200
        )
    except Exception as e:
        print(f"Error getting audio devices: {e}")
        return ErrorDTO(
            message="Failed to get audio devices",
            status_code=500
        )

@app.get('/models', response_model=SuccessDTO)
async def get_models(path = "/"):
    model_controller = ModelController()

    result: SuccessDTO | ErrorDTO = model_controller.get_models_status(path)

    if(isinstance(result, ErrorDTO)):
        raise HTTPException(status_code=result.status_code, detail=result.model_dump())
    return result


@app.post("/models/download", response_model=SuccessDTO)
async def download_model(model_name: str = "", path: str="/"):
    print(model_name)
    model_controller = ModelController()
    result: SuccessDTO | ErrorDTO = model_controller.download_new_model(model_name, path)

    if(isinstance(result, ErrorDTO)):
        raise HTTPException(status_code=result.status_code, detail=result.model_dump())
    return result

@app.delete("/models/delete", response_model=SuccessDTO)
async def remove_model_from_disk(model_name: str = "", path: str="/"):

    model_controller = ModelController()
    result: SuccessDTO | ErrorDTO = model_controller.remove_model_from_disk(model_name, path)

    if(isinstance(result, ErrorDTO)):
        raise HTTPException(status_code=result.status_code, detail=result.model_dump())
    return result


