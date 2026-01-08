from ..models.asr.adapters.pywhispercpp_adapter import PyWhisperCppAdapter
from .transcription_service import TranscriptionService


def main():
    # choose the desired adapter
    adapter = PyWhisperCppAdapter(model="base")
    asr_model = "whispercpp"
    # get the service
    service = TranscriptionService(adapter=adapter, asr_model=asr_model)

    print("\nlistening, press Ctrl+C to stop.\n")
    service.start()

    try:
        while True:
            text = service.transcribe_partial()
            if text:
                print(text)

    except KeyboardInterrupt:
        print("\n\nStopping...")
        service.stop()

        final_text = service.get_final_transcription()
        print("\n[Final Transcript]")
        print(final_text)


if __name__ == "__main__":
    print("[test.py] starting transcription service test...")
    main()
