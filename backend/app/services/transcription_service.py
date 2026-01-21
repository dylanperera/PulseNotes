# need a transcription service class that exposes
# all the stuff i need for transcriptions..
# basically i think it should do what test.py does
# but just contained?
from ..models.asr.adapters.pywhispercpp_adapter import PyWhisperCppAdapter
from ..models.asr.base_asr_interface import TranscriptionAdapter
from .audio.audio_capture_service import AudioCapture
from .audio.audio_preprocessing_service import AudioPreprocessor

class TranscriptionService():
    '''
    Docstring for TranscriptionService
    '''

    # adapter defines the actually transcription adapter we are implementing -> used to expose the model details
    #   -> this is needed to instantiate our specific asr model adapter object (i.e. pywhispercpp)
    # asr_model defines which model we are using for preprocessing
    #   -> this is needed to instantiate our audio preprocessor and use the correct model configs

    def __init__(self, asr_model: str):
        self.audio_capture = AudioCapture() # audio capture interface
        self.audio_preprocessor = AudioPreprocessor(asr_model, self.audio_capture.sample_rate) # audio preprocessor interface
        self.transcription_adapter = PyWhisperCppAdapter(
            model="small",
            sample_rate=self.audio_capture.sample_rate
        )

        self.running = False

    def start(self):
        self.audio_capture.start()
        self.running = True

    def pause(self):
        if self.running:
            self.audio_capture.pause()

    def resume(self):
        if self.running:
            self.audio_capture.resume()

    def stop(self):
        """
        Stop session and flush remaining audio.
        """
        if not self.running:
            return

        self.running = False

        while True:
            chunk = self.audio_capture.read_chunk(block=False)
            if chunk is None:
                break
            processed = self.audio_preprocessor.process_audio(chunk)
            self.transcription_adapter.add_audio_chunk(processed)

        # Final transcription
        self.transcription_adapter.transcribe(finalize=True)

        # Now stop capture
        self.audio_capture.stop()

    def process_audio(self):
        """
        MUST be called repeatedly (loop / thread / WS).
        """
        if not self.running or self.audio_capture.paused:
            return

        chunk = self.audio_capture.read_chunk(block=False)
        if chunk is None:
            return

        processed = self.audio_preprocessor.process_audio(chunk)
        self.transcription_adapter.add_audio_chunk(processed)

        # Partial transcription
        self.transcription_adapter.transcribe(finalize=False)

    # used to just ensure the final collected audio is actually processed.. basically just cleans the last transcription
    def get_transcription(self):
        """
        Read transcribed text from adapter queue.
        """
        return self.transcription_adapter.get_transcription()



