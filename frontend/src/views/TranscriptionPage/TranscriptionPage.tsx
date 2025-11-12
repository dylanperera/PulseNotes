import { useState } from "react";
import "./TranscriptionPage.css";
import { Sparkles } from "lucide-react";
import logo from "../../assets/images/PulseNotesTransparent.png";
import Calendar from "../../Components/Calendar";
import PatientName from "../../Components/PatientName";
import RecordingOptions from "../../Components/RecordingOptions";
import TextField from "../../Components/TextField";
import Timer from "../../Components/Timer";

function TranscriptionPage() {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingStarted, setRecordingStarted] = useState(false);

	const [transcript, setTranscript] = useState("");
	const [summary, setSummary] = useState("");

	const handleStartRecording = () => {
		setRecordingStarted(!recordingStarted);
	};

	const handleIsRecording = () => {
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
					<Timer
						isRecording={isRecording}
						recordingStarted={recordingStarted}
					/>
					<RecordingOptions
						isRecording={isRecording}
						recordingStarted={recordingStarted}
						handleIsRecording={handleIsRecording}
						handleStartRecording={handleStartRecording}
					/>

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
					type="button"
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
