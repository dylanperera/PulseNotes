from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_models():
    response = client.get("/models/", params={"path":"/Users/dylanperera/Desktop/test_models"})
    print(response.json())
    assert response.status_code == 200

def test_download_models():
    response = client.get("/models/download/", params={"model_name":"Llama-3.2-1B-Instruct-Q5_K_S.gguf", "path":"/Users/dylanperera/Desktop/test_models"})
    print(response.json())

def test_delete_model():
    response = client.get("/models/download/", params={"model_name":"Llama-3.2-1B-Instruct-Q5_K_S.gguf", "path":"/Users/dylanperera/Desktop/test_models"})
    print(response.json())