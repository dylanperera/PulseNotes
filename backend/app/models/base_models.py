import sounddevice as sd
import numpy as np
import time
import queue

# notes: remember to delete later
# sounddevice, a python library that under the hood uses PortAudio (a C library) to interface with system microphone
# will sample audio into a NUMPY array, and expects NUMPY arrays as input when it wants to play a recording
# so overall, we are working with numpy arrays here...
# hence if we use this, then we'll need to convert the numpy array into the required strucutre by the transcription module



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

    # opens a persistent sd stream for contious recording
    def start(self):
        if self.running:
            print("[AudioCapture]: audio capture system is already running")
            return

        self.audio_queue.queue.clear()

        # open persistent stream
        self.stream = sd.InputStream(
            samplerate=self.sample_rate,
            channels=self.channels,
            blocksize=self.chunk_size,
            dtype=self.dtype,
            callback=self._record
        )

        self.stream.start()
        self.running = True
        self.paused = False
        print("[AudioCapture] Stream started and recording.")

    # a callback function, this will get called on a seperate thread outside of the main thread
    # called automatically for each incoming block

    def _record(self, indata, frames, time, status):
        if status:
            print(status)

        if self.running and not self.paused:
            self.audio_queue.put(indata.copy())

    # DO NOT CLOSE THE STREAM
    def pause(self):
        """Temporarily pause recording without closing the stream."""
        if not self.running:
            print("[AudioCapture] Cannot pause — not running.")
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

    def stop(self):

        if not self.running:
            print("[AudioCapture]: capture already stopped")
            return

        print("[AudioCapture] Stopping capture session...")
        self.running = False
        self.paused = False

        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None

        self.audio_queue.queue.clear()
        print("[AudioCapture] Stream closed and session cleaned up.")


    # future function to allow a user to submit a audio file (or even video) and extract the audio?
    def recieve_audio_file(self):
        pass





