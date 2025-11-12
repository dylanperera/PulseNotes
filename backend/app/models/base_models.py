import sounddevice as sd
import numpy as np
import queue
from abc import ABC, abstractmethod

class AudioCapture:
    """
        Captures audio from system microphone in audiochunks via sounddevice library

        Creates a non-blocking audio stream that captures audio in buffers and processes it in buffers

        Attributes:
            sample_rate (int): the sampling rate at which we will sample incoming audio, ideally 8-16kHz for our case
            channels (int): determines whether we capture mono (1) or stereo (2), in our case we only need mono
            dtype: the data type used to store our audio data
            chunk_duration (seconds): how long in seconds each chunk is -> can play around with this to get optimal
            chunk_size (chunk_duration * sample_rate): total number of samples for the given sampling rate and duration
                - how many data points each audio chunk contains essentially

            internal fields
            stream (InputStream): used to store and maintain the InputStream we will open for persistent recording via sounddevice
            audio_queue: used to store captured audio chunks from the stream and queue them to be processed and transcribed
            running: boolean to determine if the audio capture system is running (actively recording)
            paused: boolean to determine if the audio capture system is paused (still running, but not capturing)
    """
    def __init__(self, sample_rate=16000, channels=1, chunk_duration=3.0, dtype='float32'):
        self.sample_rate = sample_rate
        self.channels = channels
        self.dtype = dtype
        self.chunk_duration = chunk_duration
        self.chunk_size = int(sample_rate * chunk_duration)
        # internal use
        self.stream = None
        self.audio_queue = queue.Queue()
        self.running = False
        self.paused = False

    def start(self):
        """
            Opens and starts audio capture via sounddevice by opening a persistent stream
        """
        if self.running:
            print("[AudioCapture]: audio capture system is already running")
            return

        # clear the queue in case previous session data leaks
        self.audio_queue.queue.clear()

        # open audio input stream, returns an numpy array of size chunk_size of type dtype containing captured audio
        self.stream = sd.InputStream(
            samplerate=self.sample_rate,
            channels=self.channels,
            blocksize=self.chunk_size,
            dtype=self.dtype,
            callback=self._record
        )

        # starts the created input stream and sets appropiate flags
        self.stream.start()
        self.running = True
        self.paused = False
        print("[AudioCapture] stream started and recording.")

    def _record(self, indata, frames, time, status):
        """
            Callback function required for the non-blocking input stream, will get called everytime input stream captures
            an entire audio chunk. Will simply push the audio chunk into our audio queue

            callback function definition based on sounddevice requirements
                indata: audio data captured by sounddevice
                time: time related data for captured audio
                status: status of audio capture, warnings or errors
        """
        if status:
            print(status)

        if self.running and not self.paused:
            self.audio_queue.put(indata.copy())


    def pause(self):
        """
            Will pause active audio capture via flags
        """
        if not self.running:
            print("[AudioCapture] cannot pause, not running")
            return
        if self.paused:
            print("[AudioCapture] already paused")
            return
        self.paused = True
        print("[AudioCapture] paused")

    def resume(self):
        """
            Will resume audio active via flags if paused
        """
        if not self.running:
            print("[AudioCapture] cannot resume, not running")
            return
        if not self.paused:
            print("[AudioCapture] already running")
            return
        self.paused = False
        print("[AudioCapture] resumed")

    # read the next audio data from the queue that will be sent to the transcription module
    # exposes chunks to stuff outside of the class, i.e. just gets the chunk from the queue
    def read_chunk(self, block=False, timeout=None):
        """
            Exposes captured audio data from the queue for the preprocessor to access and retrieve

            Queue.get():
                - block is a flag that determines how long we wait for audio data to appear
                - True means that the system will wait infinitely until audio data is present or until
                  timeout is reached -> DONT WANT THIS
                - False means that we do not wait and return immediately -> WANT THIS for proper NON-BLOCKING FUNCTIONALITY
        """
        try:
            return self.audio_queue.get(block=block, timeout=timeout)
        except queue.Empty:
            return None

    def stop(self):
        """
            Stop, close and clean up the opened stream
        """
        if not self.running:
            print("[AudioCapture]: capture already stopped")
            return

        print("[AudioCapture] stopping capture session")
        self.running = False
        self.paused = False

        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None

        self.audio_queue.queue.clear()
        print("[AudioCapture] stream closed and session cleaned up.")

    def recieve_audio_file(self):
        """
            Method that recieves and captures audio from a AUDIO FILE; FOR FUTURE IMPLEMENTATION
        """
        pass


class AudioPreprocessor:
    """
        Class to preprocess captured audio from the audio capture system into a format accepted by the desired ASR model

        Attributes:
            model: desired model in text (i.e. whispercpp)
            sample_rate: audio sampling rate
            config: configuration details for the given ASR model (how the model expects audio data to appear)
    """
    def __init__(self, model: str, sample_rate: int):
        self.model = model.lower()
        self.sample_rate = sample_rate
        self.config = self._get_model_config()

    def _get_model_config(self):
        """
            Hardcodes ASR model configurations, and will return the chosen ASR model configurations
            If we add more ASR models, we will add to the config DS, need to check the model specs for requirements
        """
        configs = {
            "whispercpp": {
                "required_sample_rate": 16000,
                "requires_mono": True,
                "requires_normalization": True,
                "required_dtype": np.float32
            },
            # ADD MORE HERE..
        }

        if self.model in configs:
            return configs[self.model]
        else:
            print(f"[WARNING] unknown model type '{self.model}', using default whisper.cpp config.")
            return configs["whispercpp"]

    def process_audio(self, audio_chunk):
        """
            Processes audio chunks by modifying the audio data captured by the audio capture system into format
            expected by the ASR model
        """
        model_config = self.config

        # if model requires normalized data
        if model_config["requires_normalization"]:
            max_val = np.max(np.abs(audio_chunk))
            if max_val > 1.0:  # Only normalize if above target range
                audio_chunk = audio_chunk / max_val

        # add more if a model requires diff. processing

        # ensure audio chunk type is equal to the required type
        audio_chunk = audio_chunk.astype(model_config["required_dtype"], copy=False)

        return audio_chunk

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











