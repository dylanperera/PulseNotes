from pathlib import Path

def get_model_path(model_name):
    # Path to the directory this utils.py file is in
    utils_dir = Path(__file__).resolve().parent
    # Go up to app/
    app_dir = utils_dir.parent
    # Model folder under backend/
    model_path = app_dir / "models" / "llm" / "model_ggufs" / model_name
    return model_path

