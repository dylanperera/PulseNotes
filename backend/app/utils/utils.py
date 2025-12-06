from pathlib import Path

def get_model_path(model_name):
    # Path to the directory this utils.py file is in
    utils_dir = Path(__file__).resolve().parent
    # Go up to app/
    app_dir = utils_dir.parent
    # Model folder under backend/
    model_path = app_dir / "models" / "llm" / "model_ggufs" / model_name
    return model_path

def get_test_data_path(file_name):
    # Path to the directory this utils.py file is in
    utils_dir = Path(__file__).resolve().parent
    # Go up to app/
    app_dir = utils_dir.parent
    # Test file under backend/
    test_file_path = app_dir / "tests" / "test_data" / file_name
    return test_file_path

def stream_response(response_stream):
    for part in response_stream:
        token = None

        # llama.cpp streaming formats
        token = (
            part.get("choices", [{}])[0]
                .get("delta", {})
                .get("content")
            or part.get("choices", [{}])[0].get("text")
            or part.get("token", {}).get("text")
        )

        if not token:
            continue

        # Print on SAME line, no newline
        print(token, end="", flush=True)

    print()  # newline at end of stream


# def stream_response(response_stream):
#     for chunk in response_stream:
#         delta = chunk['choices'][0]['delta']
#         if 'content' in delta:
#             print(delta['content'], end='', flush=True)