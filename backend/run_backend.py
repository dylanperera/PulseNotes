import socket
import sys
import os
from dotenv import load_dotenv
import uvicorn
from main import app

load_dotenv()

def is_port_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False

if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", "8000"))

    if not is_port_available(port):
        print(f"Error: Port {port} is already in use. "
              f"Set BACKEND_PORT in .env to a different port.")
        sys.exit(1)

    uvicorn.run(app, host="127.0.0.1", port=port)
