# PulseNotes - AI Medical Scribe
Project Completed By: Dylan Perera, Jayden Ferrer, Somesh Karthi, Dev Aggarawal

## 📌 Overview

PulseNotes is an offline AI-powered medical documentation tool that transcribes and summarizes physician–patient conversations while preserving patient privacy.

It runs entirely locally on-device, eliminating reliance on external APIs and ensuring compliance with healthcare data security expectations.

## 🎯 Project Goal

Develop a secure, efficient system to:
- Transcribe conversations using lightweight speech-to-text models
- Generate structured clinical summaries (e.g., SOAP notes)
- Maintain low latency, high privacy, and offline capability

## 🚀 Features

- 🗣️ Real-time transcription (Whisper-based)
- 🧠 AI-powered summarization (LLMs via llama-cpp-python)
- 🔒 Fully offline (no cloud dependency)
- ⚙️ User-selectable models
- 💾 Local model management (download/delete/status)

## 📥 Installation (For Users)
Download the latest release from: 

[PulseNotes (MacOS)](https://github.com/dylanperera/PulseNotes/releases/tag/V1.0)

_Note: If you would like to use our application, please send an email to either one of us for an access token:_
- pereradm14@gmail.com
- jaydenemail
- devemail
- someshemail


## 🛠️ Developer Setup
Make sure you have the following installed:
- Python 3.10+
- Node.js (v18+ recommended)
- uv (Python package manager)

```bash
git clone https://github.com/dylanperera/PulseNotes.git

## Backend setup
cd backend
uv venv
# Do one of the following depending on your device
source .venv/bin/activate (Mac/Linux)
.venv\Scripts\activate (Windows)
# Continue
uv sync

## Frontend setup
cd frontend
npm install
npm start
```

**How to package the app for distribution**
```bash

cd frontend
# For Mac run the following command, it wil generate a .dmg executable which can then be run for Mac devices
npm run package-mac

# For Windos run the following command, it wil generate a .exe executable which can then be run for Windows devices

```


## 🏗️ System Architecture

### High-level components:
- Frontend: Electron + React
- Backend: FastAPI
- Inference: llama-cpp-python
- Transcription: Whisper.cpp

### System Level Design
<img width="819" height="409" alt="image" src="https://github.com/user-attachments/assets/2e810657-adf3-491f-81bd-afa901a2733c" />


### _Frontend_:
The frontend is a desktop application built with Electron, enabling fully offline usage with no internet connection required.

It provides a unified interface where users can:
- View real-time transcriptions
- Generate structured summaries (e.g., SOAP notes)
- Customize prompts for summarization
- Select and manage models for both transcription and summarization
- Export the summarization in word or pdf format

Models are downloaded from Hugging Face and stored locally in the user's AppData directory, ensuring privacy and offline capability (internet is only required for initial downloads).

During a session, users can start, pause, and resume recordings. Audio is processed using Whisper, with transcriptions streamed in real time to the interface via a WebSocket connection.

Once a session is complete, users can generate a summary by triggering the summarization workflow. The transcript and custom prompt are sent through the same WebSocket to the backend, where llama-cpp-python generates the summary. The output is then streamed back and displayed live in the summarization pane.

The user can then export the summary in .word or .pdf format

### _Backend_:
The backend is built using FastAPI and consists of a set of REST endpoints along with a single WebSocket connection for real-time communication.

The architecture is organized around three main controllers:

**1. Model Handling Controller**
Responsible for managing AI models, including:
- Downloading models from Hugging Face
- Deleting models
- Reporting model availability based on system resources (e.g., RAM)

Models are stored locally in the user’s AppData directory to support offline usage.

**2. Transcription Controller**
Handles speech-to-text processing using Whisper.cpp:
- Accepts audio input and selected model
- Performs transcription using the chosen model
- Streams transcribed text to the frontend in real time via WebSocket

**3. Summarization Controller**
Handles transcript summarization using llama-cpp-python:
- Accepts transcript, custom prompt, and selected model
- Generates structured summaries (e.g., SOAP notes)
- Streams the generated output back to the frontend via WebSocket


## ⚠️ Technical Challenges

- Balancing accuracy vs latency vs model size
- Running LLMs efficiently on devices with no discrete GPU
- Managing memory constraints for local inference
- Ensuring real-time streaming performance

## 🔮 Future Improvements
- Improved summarization accuracy (larger models / fine-tuning)
- Better hallucination detection (Guardrails)
- Enhanced UI/UX (Custom prompt templates)
- Storing user information (SQLite DB)
