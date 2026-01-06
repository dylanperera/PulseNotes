from pywhispercpp.model import Model
from queue import Queue, Empty
import numpy as np
from ..base_asr_interface import TranscriptionAdapter

class PyWhisperCppAdapter(TranscriptionAdapter):
    def __init__(self, model: str):
        super().__init__(model=model)
        self.model = self._load_model(model)
        self.buffer = []
        self.transcription_queue = Queue()

    def _load_model(self, model: str):
        """
            loads pywhispercpp model.. should load from cache if downloaded
        """
        print(f"[PyWhisperCppAdapter] loading whisper.cpp model via python binding library '{model}'...")
        return Model(model, print_progress=False)

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

    # note: so i just realized right now, that in our process of transcribing we actually don't put it on a queue.. it might be good to put it onto the queue? just incase something goes down in the mean time?.. also maybe helps with accruracy
    def transcribe(self, finalize: bool = False):
        """run whisper.cpp transcription on buffered audio."""
        if not self.buffer:
            return ""

        audio = self.get_buffered_audio()
        result = self.model.transcribe(audio)
        text = result[0].text

        if not text:
            return ""

        event = {
            "type": "finalize" if finalize else "update",
            "text": text,
        }

        self.transcription_queue.put(event)

        if finalize:
            self.reset_buffer()

    def get_transcription(self, block = False, timeout=None):
        try:
            return self.transcription_queue.get(block=block, timeout=timeout)
        except Empty:
            return None
