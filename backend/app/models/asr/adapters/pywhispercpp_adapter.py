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
        # self.buffer.append([self.buffer, chunk])

        # max_samples = int(10 * self.sample_rate)
        # if len(self.buffer) > max_samples:
        #         self.buffer = self.buffer[-max_samples:]
        chunk = np.squeeze(chunk)
        self.buffer = np.concatenate([self.buffer, chunk])

        # Hard cap buffer to avoid unbounded growth (e.g. 10s)
        max_samples = int(10 * self.sample_rate)

        if self.buffer.size > max_samples:
            overflow = self.buffer.size - max_samples
            self.buffer = self.buffer[overflow:]
            self.processed_samples = max(0, self.processed_samples - overflow)


    def get_buffered_audio(self) -> np.ndarray:
        """ return concatenated numpy audio waveform to be fed into whisper."""
        # if not self.buffer:
        #     return np.array([], dtype=np.float32)
        # # ensure that it is a continous waveform
        # return np.concatenate(self.buffer, axis=0)
        return self.buffer

    def reset_buffer(self):
        """clear buffered audio chunks."""
        self.buffer = np.array([], dtype=np.float32)
        self.processed_samples = 0
        self.last_text = ""

    # note: so i just realized right now, that in our process of transcribing we actually don't put it on a queue.. it might be good to put it onto the queue? just incase something goes down in the mean time?.. also maybe helps with accruracy
    # def transcribe(self, finalize: bool = False):
    #     """run whisper.cpp transcription on buffered audio."""
    #     # if not self.buffer:
    #     #     return ""

    #     if not finalize:
    #         return

    #     audio = self.get_buffered_audio()

    #     if audio.size == 0:
    #         return

    #     result = self.model.transcribe(audio)
    #     text = result[0].text

    #     if text:
    #         self.transcription_queue.put({
    #             "type": "finalize",
    #             "text": text,
    #         })

    #     self.reset_buffer()
    # def transcribe(self, finalize: bool = False):
    #     if len(self.buffer) < self.window_size:
    #         return

    #     # ONLY transcribe most recent window
    #     audio = self.buffer[-self.window_size:]

    #     result = self.model.transcribe(audio)
    #     text = result[0].text.strip()

    #     if not text or text == self.last_text:
    #         return

    #     self.last_text = text

    #     self.transcription_queue.put({
    #         "type": "final" if finalize else "partial",
    #         "text": text
    #     })

    #     if finalize:
    #         self.buffer = np.array([], dtype=np.float32)
    #         self.last_text = ""
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
