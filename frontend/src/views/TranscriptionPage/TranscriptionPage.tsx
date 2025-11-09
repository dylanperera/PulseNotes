import React, { useState } from "react";
import "./TranscriptionPage.css"; 
import logo from "../../assets/images/PulseNotesTransparent.png"; 
import { Mic, Pause, Sparkles } from "lucide-react";
import TranslateIcon from '@mui/icons-material/Translate';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import MicIcon from '@mui/icons-material/Mic';
import PauseIcon from '@mui/icons-material/Pause';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import PatientName from "../../Components/PatientName";
import Calendar from "../../Components/Calendar";
import Timer from "../../Components/Timer";
import RecordingOptions from "../../Components/RecordingOptions";
import TextField from "../../Components/TextField";

function TranscriptionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);

  const [time, setTimer] = useState()

  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

  const handleMicClick = () => {
    setIsRecording(!isRecording);
  };

  const handleSummarize = () => {
    if (!isRecording) {
      alert("Summarization service gets called");
    }
  };


  return (
    <div className="app-container">

      {/* Header */}
      <div className="top-level-header">
          <PatientName />
          <div className="main-options">
            <Timer isRecording={isRecording}/>
            <RecordingOptions />

            {/* <button className="button-inline btn">
              { recordingStarted ? < }
              <p>00:00:00</p>
            </button> */}
          </div>

      </div>
      
      <div className="second-level-header">
        <Calendar />

        <button
          className="summarize-button"
          onClick={handleSummarize}
          disabled={isRecording}
        >
          <b>SUMMARIZE</b>
          <Sparkles size={20} className="summarize-icon" />
        </button>
      </div>
      

    
      <div className="content">
        <TextField 
            isRecording={isRecording} 
            text={transcript} 
            handleTextChange={setTranscript}
            placeHolder="Start recording or type notes here..."
            />
        <TextField 
            isRecording={isRecording} 
            text={summary} 
            handleTextChange={setSummary}
            placeHolder="Summary..."
            />
      </div>

      {/* Footer */}
      <div className="footer">
        <img src={logo} alt="Pulse Notes Logo" /> 
      </div>
    </div>
  );
}

export default TranscriptionPage;
