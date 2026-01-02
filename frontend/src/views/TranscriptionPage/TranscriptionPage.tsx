import { useState, useEffect } from "react";
import "./TranscriptionPage.css";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import logo from "../../assets/images/PulseNotesTransparent.png";
import Calendar from "../../Components/Calendar";
import ExportButton from "../../Components/ExportButton";
import NewSessionButton from "../../Components/NewSessionButton";
import PatientName from "../../Components/PatientName";
import RecordingOptions from "../../Components/RecordingOptions";
import SelectModelOptions from "../../Components/SelectModelOptions";
import TextField from "../../Components/TextField";
import Timer from "../../Components/Timer";
import useWebSocket, { ReadyState } from "react-use-websocket";

type WSMessage = {
	type: string;
	payload: string;
}

function TranscriptionPage() {

	// TODO: Look into changing this to be dynamic just in case a port is blocked
  	const WS_URL = "http://127.0.0.1:8000/ws" 

	const [isRecording, setIsRecording] = useState(false);
	const [recordingStarted, setRecordingStarted] = useState(false);

	const [transcript, setTranscript] = useState("");
	const [summary, setSummary] = useState("");

	const [doneSummarizing, setDoneSummarizing] = useState(false);

	// Create websocket - There will be one web socket for both transcription and summarization
	// This is to save on memory and latency (multiplexing)
	const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WSMessage>(
		WS_URL,
		{
			share: false,
			shouldReconnect: () => true,
		},
  	)

	const handleStartRecording = () => {
		setRecordingStarted(!recordingStarted);
	};

	const handleIsRecording = () => {
		setIsRecording(!isRecording);
	};

	useEffect(() => {
		
		if(!lastJsonMessage) return;

		// if the lastjsonmessagetype is summary_token
		if(lastJsonMessage.type === "summary_token"){
			// get the payload, and add it to the text area for the summary
			setSummary((s) => s + lastJsonMessage.payload)

		} else if (lastJsonMessage.type === "summary_token_end") {
			setDoneSummarizing(true);
		}


  	}, [lastJsonMessage])
	

	const handleSummarizeClick = () => {
		if (!isRecording && readyState === ReadyState.OPEN) {
			sendJsonMessage({
				type:"transcription_chunk",
				payload: transcript
			})
		}

		// handle when readystate is not open
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
							onClick={handleSummarizeClick}
							disabled={isRecording}
							type="button"
						>
							<b>SUMMARIZE</b>
							<AutoAwesomeIcon />
						</button>
					</div>
				) : (
					<ExportButton />
				)}
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
