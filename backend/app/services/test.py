from ..models.transcription_adapters import PyWhisperCppAdapter
from ..models.base_models import AudioCapture
from ..models.base_models import AudioPreprocessor
import time

def main():
    adapter = PyWhisperCppAdapter(model="small")
    capture = AudioCapture()
    preproc = AudioPreprocessor("whispercpp", sample_rate=capture.sample_rate)

    capture.start()
    print("\nlistening, press Ctrl+C to stop.\n")

    try:
        while True:
            chunk = capture.read_chunk(block=False)
            if chunk is not None:
                # preprocess and feed into the ASR
                processed = preproc.process_audio(chunk)
                adapter.add_audio_chunk(processed)

                # run a partial transcription every few seconds
                partial_text = adapter.transcribe(finalize=False)
                if partial_text.strip():
                    print(f"\r{partial_text.strip()}", end="", flush=True)
                    adapter.reset_buffer()

            time.sleep(0.2)  # small delay to reduce CPU load

    except KeyboardInterrupt:
        print("\n\nstopping...")
        capture.stop()

        # Final transcription
        final_text = adapter.transcribe(finalize=True)
        print("\n[final Transcript]")
        print(final_text)

if __name__ == "__main__":
    print("[test.py] starting transcription adapter test...")
    main()