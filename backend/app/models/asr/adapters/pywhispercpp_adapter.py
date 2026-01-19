from pywhispercpp.model import Model
from queue import Queue, Empty
import numpy as np
from ..base_asr_interface import TranscriptionAdapter

class PyWhisperCppAdapter(TranscriptionAdapter):
    def __init__(self, model: str, sample_rate):
        super().__init__(model=model)
        self.model = self._load_model(model)
        self.buffer = np.array([], dtype = np.float32)
        self.transcription_queue = Queue()
        self.sample_rate = sample_rate
        self.processed_samples = 0
        self.last_text = ""
        self.window_size = int(1.5 * self.sample_rate)

    def _load_model(self, model: str):
        """
            loads pywhispercpp model.. should load from cache if downloaded
        """
        print(f"[PyWhisperCppAdapter] loading whisper.cpp model via python binding library '{model}'...")
        return Model(model, print_progress=False)

    def add_audio_chunk(self, chunk: np.ndarray):
        # """ buffer preprocessed numpy audio chunks. """

        chunk = np.squeeze(chunk)
        self.buffer = np.concatenate([self.buffer, chunk])

        # hard cap buffer to avoid unbounded growth
        max_samples = int(10 * self.sample_rate)

        if self.buffer.size > max_samples:
            overflow = self.buffer.size - max_samples
            self.buffer = self.buffer[overflow:]
            self.processed_samples = max(0, self.processed_samples - overflow)


    def get_buffered_audio(self) -> np.ndarray:
        """ return concatenated numpy audio waveform to be fed into whisper."""
        return self.buffer

    def reset_buffer(self):
        """clear buffered audio chunks."""
        self.buffer = np.array([], dtype=np.float32)
        self.processed_samples = 0
        self.last_text = ""

    def transcribe(self, finalize: bool = False):
        """
        Run transcription on NEW audio only.
        """
        available = self.buffer.size - self.processed_samples

        if available < self.window_size and not finalize:
            return

        # Take only new audio
        audio = self.buffer[self.processed_samples:]

        if audio.size == 0:
            return

        result = self.model.transcribe(audio)
        text = result[0].text.strip()

        if not text or text == self.last_text:
            return

        self.last_text = text

        self.transcription_queue.put({
            "type": "final" if finalize else "partial",
            "text": text,
        })

        # Mark audio as processed
        self.processed_samples = self.buffer.size

        if finalize:
            self.reset_buffer()

    def get_transcription(self, block = False, timeout=None):
        try:
            return self.transcription_queue.get(block=block, timeout=timeout)
        except Empty:
            return None
