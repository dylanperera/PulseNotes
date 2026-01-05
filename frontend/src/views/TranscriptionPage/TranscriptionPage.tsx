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

type WSMessage = {
	type: string;
	payload: string;
}

// update something here for transcription service ws

function TranscriptionPage() {

	// TODO: Look into changing this to be dynamic just in case a port is blocked
  	const WS_URL = "http://127.0.0.1:8000/ws"

	const [isRecording, setIsRecording] = useState(false);
	const [recordingStarted, setRecordingStarted] = useState(false);

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
		setRecordingStarted(!recordingStarted);
	};

	const handleIsRecording = () => {
		setIsRecording(!isRecording);
	};

	// probably one of these
	useEffect(() => {

		if(!lastJsonMessage) return;

		if(lastJsonMessage.type === "summary_token"){
			// get the payload, and add it to the text area for the summary
			if(hasStarted.current === true){
				hasStarted.current = false;
				setIsLoading(false);
			}
			setSummary((s) => s + lastJsonMessage.payload)

		} else if (lastJsonMessage.type === "summary_token_end") {
			setIsGeneratingSummary(false);
		}


  	}, [lastJsonMessage]);

	const handleSummarizeClick = () => {
		if (!isRecording && readyState === ReadyState.OPEN) {
			sendJsonMessage({
				type:"transcription_chunk",
				payload: transcript
			})

		}

		hasStarted.current = true;
		setIsLoading(true);
		setIsGeneratingSummary(true);


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
