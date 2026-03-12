MODEL_REGISTRY = [

    # -------------------------
    # TRANSCRIPTION MODELS
    # -------------------------

    {
        "model_download_name": "tiny",
        "model_display_name": "Tiny (WhisperCPP)",
        "model_description": "Fastest transcription with lowest latency",
        "model_type": "transcription",
        "source": "url",
        "download_url": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
        "file": "ggml-tiny.bin",
        "local_path": "models/transcription",
        "size": 0.39
    },

    {
        "model_download_name": "base",
        "model_display_name": "Base (WhisperCPP)",
        "model_description": "Balanced speed and accuracy",
        "model_type": "transcription",
        "source": "url",
        "download_url": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
        "file": "ggml-base.bin",
        "local_path": "models/transcription",
        "size": 0.74
    },

    {
        "model_download_name": "medium",
        "model_display_name": "Medium (WhisperCPP)",
        "model_description": "Higher accuracy for complex speech",
        "model_type": "transcription",
        "source": "url",
        "download_url": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin",
        "file": "ggml-medium.bin",
        "local_path": "models/transcription",
        "size": 1.5
    },

    {
        "model_download_name": "large",
        "model_display_name": "Large V3 (WhisperCPP)",
        "model_description": "Best transcription quality but slower",
        "model_type": "transcription",
        "source": "url",
        "download_url": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin",
        "file": "ggml-large-v3.bin",
        "local_path": "models/transcription",
        "size": 3.1
    },

    # -------------------------
    # SUMMARIZATION MODELS
    # -------------------------

    {
        "model_download_name": "llama32",
        "model_display_name": "Llama 3.2",
        "model_description": "General purpose language model for clinical summarization",
        "model_type": "summarization",
        "source": "huggingface",
        "repo": "DylanPerera1/pulsenotes-med-models",
        "file": "Llama-3.2-1B-Instruct-Q5_K_S.gguf",
        "local_path": "models/summarization",
        "size": 0.893
    },

    {
        "model_download_name": "mediphi",
        "model_display_name": "Medi-Phi",
        "model_description": "Medical-focused language model optimized for clinical text",
        "model_type": "summarization",
        "source": "huggingface",
        "repo": "DylanPerera1/pulsenotes-med-models",
        "file": "MediPhi-Clinical.i1-Q4_K_M.gguf",
        "local_path": "models/summarization",
        "size": 2.39
    }

]