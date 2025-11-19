from pywhispercpp.model import Model
import numpy as np
from ..base_asr_interface import TranscriptionAdapter

class PyWhisperCppAdapter(TranscriptionAdapter):
    def __init__(self, model: str):
        super().__init__(model=model)
        self.model = self._load_model(model)
        self.buffer = []

    def _load_model(self, model: str):
        """
            loads pywhispercpp model.. should load from cache if downloaded
        """
        print(f"[PyWhisperCppAdapter] loading whisper.cpp model via python binding library '{model}'...")
        return Model(model)

    def add_audio_chunk(self, chunk: np.ndarray):
        """ buffer preprocessed numpy audio chunks. """
        self.buffer.append(chunk)

    def get_buffered_audio(self) -> np.ndarray:
        """ return concatenated numpy audio waveform to be fed into whisper."""
        if not self.buffer:
            return np.array([], dtype=np.float32)
        # ensure that it is a continous waveform
        return np.concatenate(self.buffer, axis=0)

    def reset_buffer(self):
        """clear buffered audio chunks."""
        self.buffer = []

    def transcribe(self, finalize: bool = False) -> str:
        """run whisper.cpp transcription on buffered audio."""
        if not self.buffer:
            return ""

        audio = self.get_buffered_audio()
        result = self.model.transcribe(audio)
        text = result[0].text

        if finalize:
            self.reset_buffer()

        return text