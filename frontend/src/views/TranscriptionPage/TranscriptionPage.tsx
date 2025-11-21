import { useState } from "react";
import "./TranscriptionPage.css";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import logo from "../../assets/images/PulseNotesTransparent.png";
import Calendar from "../../Components/Calendar";
import NewSessionButton from "../../Components/NewSessionButton";
import PatientName from "../../Components/PatientName";
import RecordingOptions from "../../Components/RecordingOptions";
import SelectModelOptions from "../../Components/SelectModelOptions";
import TextField from "../../Components/TextField";
import Timer from "../../Components/Timer";
import ExportButton from "../../Components/ExportButton";

function TranscriptionPage() {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingStarted, setRecordingStarted] = useState(false);

	const [transcript, setTranscript] = useState("");
	const [summary, setSummary] = useState("");

	const [doneSummarizing, setDoneSummarizing] = useState(false);

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

		setDoneSummarizing(true);
	};

	return (
		<div className="app-container">
			{/* Header */}
			<div className="top-level-header">
				<div style={{ display: "flex" }}>
					<PatientName />
					<NewSessionButton isRecording={isRecording} />
				</div>

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
				</div>
			</div>

			<div className="second-level-header">
				<Calendar />

				{!doneSummarizing ? (
					<div className="main-options">
						<SelectModelOptions />
						<button
							className="summarize-button"
							onClick={handleSummarize}
							disabled={isRecording}
							type="button"
						>
							<b>SUMMARIZE</b>
							<AutoAwesomeIcon />
						</button>
					</div>
				) : (<ExportButton/>)				
				}
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
