from abc import ABC, abstractmethod


class TranscriptionAdapter(ABC):
    """
        Abstract class used to define the contract ASR models must follow and implement. Each ASR mpdel we use must
        implement this class, implementation details will be ASR specific
        Allows for plug and play of different ASR models
    """
    def __init__(self, model):
        super().__init__()
        self.model = model
        self.buffer = []  # stores accumulated audio chunks

    @abstractmethod
    def _load_model(self, model: str):
        """load the ASR model into memory."""
        pass

    @abstractmethod
    def add_audio_chunk(self, chunk):
        """add a preprocessed audio chunk to the model’s buffer."""
        pass

    @abstractmethod
    def get_buffered_audio(self):
        """gets buffered audio to be transcribed."""
        pass

    @abstractmethod
    def reset_buffer(self):
        """clear the model’s internal audio buffer."""
        pass

    @abstractmethod
    def transcribe(self, finalize: bool = False) -> str:
        """
        run transcription on the buffered audio.
        if finalize=True → return final result & clear buffer.
        """
        pass

    @abstractmethod
    def get_transcription(self):
        pass
