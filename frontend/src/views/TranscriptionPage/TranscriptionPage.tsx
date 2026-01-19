import { useState, useRef, useEffect } from "react";
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
import RichTextField from "../../Components/RichTextField";

type WSMessage =
	| {
			type: "transcription_token";
			payload: {
				type: "partial" | "final";
				text: string;
			};
	  }
	| {
			type: "summary_token";
			payload: string;
	  }
	| {
			type: "summary_token_end";
			payload: null;
	  };

type RecordingState = "idle" | "recording" | "paused";

function TranscriptionPage() {

	// TODO: Look into changing this to be dynamic just in case a port is blocked
  	//const WS_URL = "http://127.0.0.1:8000/ws"
	const WS_URL = "ws://127.0.0.1:8000/ws"

	const [recordingState, setRecordingState] = useState<RecordingState>("idle");

	const [transcript, setTranscript] = useState("");
	const [summary, setSummary] = useState("");

	const [isLoading, setIsLoading] = useState(false); // Loading state for summary
	const hasStarted = useRef(false) // ref to check if recording has started summarizing (more of a safe-guard to remove the loading spinner)

	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);


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
		if (readyState !== ReadyState.OPEN) return;
		if (recordingState !== "idle") return;

		sendJsonMessage({ type: "start_transcription" });
		setRecordingState("recording");
	};

	const handlePauseRecording = () => {
		if (readyState !== ReadyState.OPEN) return;
		if (recordingState !== "recording") return;

		sendJsonMessage({ type: "pause_transcription" });
		setRecordingState("paused");
	};

	const handleResumeRecording = () => {
		if (readyState !== ReadyState.OPEN) return;
		if (recordingState !== "paused") return;

		sendJsonMessage({ type: "resume_transcription" });
		setRecordingState("recording");
	};

	const handleStopRecording = () => {
		if (readyState !== ReadyState.OPEN) return;
		if (recordingState === "idle") return;

		sendJsonMessage({ type: "stop_transcription" });
		setRecordingState("idle");
	};

	useEffect(() => {

		if(!lastJsonMessage) return;

		switch(lastJsonMessage.type) {
			case "transcription_token": {
				const { type, text } = lastJsonMessage.payload;

				if (type === "partial") {
					setTranscript(prev => prev + text + " ");
				}

				if (type === "final") {
					setTranscript(prev => prev + "\n" + text + "\n");
				}

				break;
			}

			case "summary_token":
				// get the payload, and add it to the text area for the summary
				if(hasStarted.current === true){
					hasStarted.current = false;
					setIsLoading(false);
				}
				setSummary((s) => s + lastJsonMessage.payload)
				break
			case "summary_token_end":
				setIsGeneratingSummary(false);
				break
		}

  	}, [lastJsonMessage]);

	const handleSummarizeClick = () => {
		if (recordingState === "recording") return;
    	if (readyState !== ReadyState.OPEN) return;

	    sendJsonMessage({
			type: "transcription_chunk",
			payload: transcript,
		});

		hasStarted.current = true;
		setIsLoading(true);
		setIsGeneratingSummary(true);
	};

	const isRecording = recordingState === "recording"

	return (
		<div className="app-container">
			{/* Header */}
			<div className="top-level-header">
				<div style={{ display: "flex" }}>
					<PatientName />
					<NewSessionButton isRecording={isRecording} />
				</div>

				<div className="main-options">
					<Timer isRecording={isRecording} />
					<RecordingOptions
						recordingState={recordingState}
						onStart={handleStartRecording}
						onPause={handlePauseRecording}
						onResume={handleResumeRecording}
						onStop={handleStopRecording}
					/>
				</div>
			</div>

			<div className="second-level-header">
				<Calendar />



				<div className="main-options">
						{/* <SelectModelOptions /> */}
						<button
							className={`summarize-button ${ (isRecording === true || isGeneratingSummary === true) ? 'summarize-button-off' : 'summarize-button-on' }`}
							onClick={handleSummarizeClick}
							disabled={(isRecording === true || isGeneratingSummary === true)}
							type="button"
						>
							<b>SUMMARIZE</b>
							<AutoAwesomeIcon />
						</button>
					<ExportButton/>
				</div>

			</div>

			<div className="content">
				<TextField
					id="transcript"
					isRecording={isRecording}
					isLoading={isLoading}
					text={transcript}
					setContent={setTranscript}
					placeHolder="Start recording or type notes here..."
				/>
				<RichTextField
  					id="summary"
  					text={summary}
  					setContent={setSummary}
  					isRecording={isRecording}
  					isLoading={isLoading}
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
