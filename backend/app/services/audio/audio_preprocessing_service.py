import numpy as np

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