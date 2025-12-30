from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from app.controllers.summarization_controller import SummarizationController

app = FastAPI()


html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <textarea id="messageText" autocomplete="off" rows="20" cols="20"></textarea>
            <button>Send</button>
        </form>
        <textarea id="response" autocomplete="off" rows="20" cols="20"></textarea>

        <script>
            var ws = new WebSocket("ws://localhost:8000/summarize");
            ws.onmessage = function(event) {
                var messages = document.getElementById('response')
                messages.value += event.data
                
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                console.log(input.value)
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


# Endpoint to summarize text
# Input: Transcript -> Given in one go
# Output: Summary -> Streamed back 
@app.websocket("/summarize")
async def summary_websocket(websocket: WebSocket):

    summarization_controller = SummarizationController(websocket)

    await summarization_controller.connect_ws(websocket)

    await summarization_controller.summarize_transcript()