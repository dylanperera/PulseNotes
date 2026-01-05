from ..models.asr.adapters.pywhispercpp_adapter import PyWhisperCppAdapter
from .audio.audio_capture_service import AudioCapture
from .audio.audio_preprocessing_service import AudioPreprocessor

def main():
    adapter = PyWhisperCppAdapter(model="base")
    capture = AudioCapture()
    preproc = AudioPreprocessor("whispercpp", sample_rate=capture.sample_rate)

    capture.start()
    print("\nlistening, press Ctrl+C to stop.\n")

    try:
        while True:
            chunk = capture.read_chunk(block=True)

            processed = preproc.process_audio(chunk)
            adapter.add_audio_chunk(processed)

            partial_text = adapter.transcribe(finalize=False)

            if partial_text.strip():
                print(partial_text.strip())
                adapter.reset_buffer()   # <-- REQUIRED to stop repeats

    except KeyboardInterrupt:
        print("\n\nStopping...")
        capture.stop()

        final_text = adapter.transcribe(finalize=True)
        print("\n[Final Transcript]")
        print(final_text)


if __name__ == "__main__":
    print("[test.py] starting transcription adapter test...")
    main()
