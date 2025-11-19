from ..models.asr.adapters.pywhispercpp_adapter import PyWhisperCppAdapter
from .audio.audio_capture_service import AudioCapture
from .audio.audio_preprocessing_service import AudioPreprocessor
import time
import shutil

def print_clean(text):
    columns = shutil.get_terminal_size((80, 20)).columns
    # Clear the line with spaces, then print text
    print("\r" + " " * columns, end="")   # wipe line
    print("\r" + text, end="", flush=True)


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
                    print_clean(partial_text.strip())
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