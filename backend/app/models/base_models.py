import sounddevice as sd
import numpy as np
import time
import queue
from abc import ABC, abstractmethod

# notes: remember to delete later
# sounddevice, a python library that under the hood uses PortAudio (a C library) to interface with system microphone
# will sample audio into a NUMPY array, and expects NUMPY arrays as input when it wants to play a recording
# so overall, we are working with numpy arrays here...
# hence if we use this, then we'll need to convert the numpy array into the required strucutre by the transcription module

# TECHNICAL NOTES: REMOVE AFTER.. ADD TO NODES
# using sounddevice, in order to meet our requirements of continous recording, we'll require a lower-level stream
# that is non-blocking. why non-blocking? in our application, we want to capture audio and then preprocess and feed into the
# transcription model at the same time. non-blocking will allow the main thread to continue capturing audio
# and will take in a callback function that is run on a seperate thread that we can use to then process the audio
# in this case for audiocapture class seperation of concerns, just add the audio into a queue that the preprocessor will read
# this callback function gets called every time a chunk of audio has been captured by the main thread (size is based on our
# sampling rate and chunk duration)

# stream class types
# Stream Class: opens a input and output stream.. in our case we only need an input stream
# InputStream Class: opens only a input stream, and methods hence are only for audio input functionality
#   - with the InputStream, we now have two branches
#   1. RawInputStream: this will capture RAW unprocessed PCM audio (i.e. the absolute rawest audio)
#   2. InputStream: will do some processing and convert the audio into numpy arrays

#   - in our case, if we are sticking with a python backend, i think we can stick with the InputStream and work with
#     numpy arrays, with numpy arrays we have built in functionality for certain operations esp for signal processing
#     also, we can still transform the signal if requires.. no need for manual byte processing etc.

# non-blocking stream notes
#   if we use the non-blocking approach, we make sure that the main thread is not blocked while audio is being captured
#   so essentially we'll have two threads
#   main thread: this is what will be performing the capture of audio_chunks
#   callback thread: this is the thread that will run the callback function, it gets called whenever the main thread
#   produces a audio_chunk, and in our case will just add the audio_chunk into a queue... which the audio preprocessor will
#   read from

class AudioCapture:
    """
        sample_rate: sampling frequency of the audio; will impact our accurate our audio capture
            - for transcription type applications 8-16kHz is sufficient

        channels: determines whether we want mono (1) or stereo (2) audio capture
            - for transcription type applications, mono is enough
            - stereo would mean our data contains [left, right] samples, which is just redudant and not needed in this case

        dtype: determines the type of these samples in the numpy arrays
            - different options, may need to adjust this based on accuracy/performance issues and what the ASR requires

        chunk_duration: how long in seconds each chunk we capture (because we'll need to send partial results in FE),
                        we need to record in chunks so we can pre-process and send to the ASR in chunks
            - can adjust this based on latency issues, i think ideally we want the highest possible without severse performance
              issues

        chunk_size: the number of samples per chunk; just a function of the sampling rate and chunk duration

        running: boolean that determines if they overall microphone is running or not

        paused: boolean that determines if we are paused

        # INTERNAL STUFF
        stream: stores the sounddevice stream we create, gives access to the recording control methods
                i.e. start, stop and close -> can open different types of streams, but in our case a
                InputStream will capture audio as numpy arrays of the provided dtype
                - provide a callback function to make it non-blocking

        audio_queue: queue that stores audio chunks captured, and will be sent to prepprocesing module

    """
    def __init__(self, sample_rate=16000, channels=1, chunk_duration=2.0, dtype='float32'):
        self.sample_rate = sample_rate
        self.channels = channels
        self.dtype = dtype
        self.chunk_duration = chunk_duration
        self.chunk_size = int(sample_rate * chunk_duration)

        # internal
        # this allows us to access the persistent stream and start, stop and close it!
        self.stream = None
        self.audio_queue = queue.Queue()
        self.running = False
        self.paused = False

    # opens a persistent input stream for continous recording

    def start(self):
        if self.running:
            print("[AudioCapture]: audio capture system is already running")
            return

        # clear the queue such that previous sessions don't possibly impact this one.. just for cleanliness
        self.audio_queue.queue.clear()

        # open a persistent input stream, sampled at sample_rate, with channels (should just be mono = 1),
        # with the provided block_size
        # will capture audio in chunks, where each chunk is chunk_size that will be stored by the provided dtype
        # provide a callback to make it non-blocking
        self.stream = sd.InputStream(
            samplerate=self.sample_rate,
            channels=self.channels,
            blocksize=self.chunk_size,
            dtype=self.dtype,
            callback=self._record
        ) # NOTE: will return CHUNKS of size CHUNK_SIZE represents as NUMPY ARRAYS using DTYPE

        # actually start the stream... will begin the recording process
        self.stream.start()
        self.running = True
        self.paused = False
        print("[AudioCapture] stream started and recording.")

    # a callback function, this will get called on a seperate thread outside of the main thread
    # called automatically for each incoming block

    # callback definition: _callback(indata, outdata, frames, time, status)
    #   indata -> audio chunk that the main thread captured
    #   frames -> number of samples in this chunk -> should be equal to the chunk_size
    #   time -> timing data
    #   status -> any stream warnings/issues
    # so in our case, we only need the indata, and we push the audio_chunk captured by the main thread into the queue!
    def _record(self, indata, frames, time, status):
        if status:
            print(status)

        # if we're running and not paused, then we just put the
        if self.running and not self.paused:
            self.audio_queue.put(indata.copy())

    # DO NOT CLOSE THE STREAM
    def pause(self):
        if not self.running:
            print("[AudioCapture] cannot pause, ")
            return
        if self.paused:
            print("[AudioCapture] Already paused.")
            return
        self.paused = True
        print("[AudioCapture] Capture paused.")

    def resume(self):
        """Resume recording after a pause."""
        if not self.running:
            print("[AudioCapture] Cannot resume — not running.")
            return
        if not self.paused:
            print("[AudioCapture] Already running.")
            return
        self.paused = False
        print("[AudioCapture] Capture resumed.")

    # read the next audio data from the queue that will be sent to the transcription module
    # exposes chunks to stuff outside of the class, i.e. just gets the chunk from the queue
    def read_chunk(self, block=False, timeout=None):
        """
        Retrieve the next available chunk from the queue.
        - block=True  : waits until data is available
        - block=False : returns None immediately if no data
        """
        try:
            return self.audio_queue.get(block=block, timeout=timeout)
        except queue.Empty:
            return None

    # stop and close the stream
    def stop(self):

        if not self.running:
            print("[AudioCapture]: capture already stopped")
            return

        print("[AudioCapture] Stopping capture session...")
        self.running = False
        self.paused = False

        if self.stream:
            # stops the stream
            self.stream.stop()
            # closes and cleans it up..
            self.stream.close()
            self.stream = None

        self.audio_queue.queue.clear()
        print("[AudioCapture] Stream closed and session cleaned up.")


    # future function to allow a user to submit a audio file (or even video) and extract the audio?
    def recieve_audio_file(self):
        pass


class AudioPreprocessor:
    def __init__(self, model: str, sample_rate: int):
        self.model = model.lower()
        self.sample_rate = sample_rate
        self.config = self._get_model_config()

    def _get_model_config(self):
        # adjust this based on which model we're using and their required types
        configs = {
            "whispercpp": {
                "required_sample_rate": 16000,
                "requires_mono": True,
                "requires_normalization": True,
                "required_dtype": np.float32
            },
            # add more in the future
        }

        if self.model in configs:
            return configs[self.model]
        else:
            print(f"[WARNING] Unknown model type '{self.model}', using default whisper.cpp config.")
            return configs["whispercpp"]

    # using the audio capture, sounddevice library, audio chunks are numpy arrays
    def process_audio(self, audio_chunk):
        model_config = self.config

        # if model requires normalized data.. nornmalize
        if model_config["requires_normalization"]:
            max_val = np.max(np.abs(audio_chunk))
            if max_val > 1.0:  # Only normalize if above target range
                audio_chunks = audio_chunks / max_val

        audio_chunk = audio_chunk.astype(model_config["required_dtype"], copy=False)

        return audio_chunk











