import React, { useState } from "react";
import "./TranscriptionPage.css"; 
import logo from "../../assets/images/PulseNotesLogo.png"; 
import { Mic, Pause, Sparkles } from "lucide-react";

function TranscriptionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState("");

  const handleMicClick = () => {
    setIsRecording(!isRecording);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRecording) setText(e.target.value);
  };

  const handleSummarize = () => {
    if (!isRecording) {
      alert("Summarization service gets called");
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <img src={logo} alt="Pulse Notes Logo" className="logo" />
      </div>

      <div className="content">
        <div className="text-area-container">
          {isRecording && (
            <p className="recording-status">TRANSCRIBING IN PROCESS...</p>
          )}
          <textarea
            className={`text-area ${isRecording ? "disabled" : ""}`}
            placeholder="Start recording or type notes here..."
            value={text}
            onChange={handleTextChange}
            disabled={isRecording}
          />
        </div>

        <div className="controls">
          <button
            className={`mic-button ${isRecording ? "recording" : ""}`}
            onClick={handleMicClick}
          >
            <span className="mic-icon">
              {isRecording ? <Pause size={80} /> : <Mic size={80} />}
            </span>
          </button>

          <button
            className="summarize-button"
            onClick={handleSummarize}
            disabled={isRecording}
          >
            <span>SUMMARIZE</span>
            <Sparkles size={20} className="summarize-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TranscriptionPage;
