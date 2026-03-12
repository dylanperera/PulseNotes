import { useEffect, useRef, useState } from "react";
import "./TranscriptionPage.css";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import useWebSocket, { ReadyState } from "react-use-websocket";
import dayjs, { type Dayjs } from "dayjs";
import logo from "../../assets/images/PulseNotesTransparent.png";
import Calendar from "../../Components/Calendar";
import ExportButton from "../../Components/ExportButton";
import NewSessionButton from "../../Components/NewSessionButton";
import PatientName from "../../Components/PatientName";
import RecordingOptions from "../../Components/RecordingOptions";
import RichTextField from "../../Components/RichTextField";
import SelectModelOptions from "../../Components/SelectModelOptions";
import TextField from "../../Components/TextField";
import Timer from "../../Components/Timer";
import SettingsModal from "../../Components/SettingsModal";
import SettingsIcon from "@mui/icons-material/Settings";
import { Chip } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


const initialPrompt: string = `You are a clinical documentation assistant. Your job is to create a concise clinical SUMMARY and SOAP note based ONLY on what is stated in the conversation. You MUST NOT add, infer, or guess any medical details.

        STRICT RULES (DO NOT BREAK THESE):
        - Do NOT diagnose anything (no anxiety disorder, depression, cardiomyopathy, etc.).
        - Do NOT suggest or imply causes of symptoms.
        - Do NOT recommend treatments, coping strategies, lifestyle changes, or follow-up plans.
        - Do NOT add tests, referrals, or medical actions unless explicitly stated by the doctor.
        - Do NOT state or invent vital signs, normal results, abnormal results, or physical exam findings.
        - Do NOT expand the plan beyond what the doctor actually said.
        - Do NOT use terms like “should,” “needs to,” “likely,” “could indicate,” or similar inference language.

        ALLOWED:
        - ONLY describe what the patient and doctor explicitly said.
        - You MAY summarize patterns using neutral phrasing such as:
        “Based on the patient’s report…”
        “Symptoms tend to occur during…”
        “The patient describes…”

        FORMAT REQUIREMENTS:

        SUMMARY (4 sentences):
        - Include major symptoms, patterns, triggers, emotional themes, sleep issues, stressors, and patient goals.
        - Keep it factual and clinically neutral.
        - DO NOT give interpretations or advice.

        SOAP NOTE:

        Subjective:
        - List ONLY patient-reported symptoms, stressors, emotional themes, sleep patterns, and concerns.
        - No interpretations.

        Objective:
        - ONLY include objective findings if explicitly spoken by the doctor.
        - If none were discussed, write: “No objective findings were discussed.”

        Assessment:
        - Summarize symptom patterns WITHOUT diagnosing or giving medical explanations.
        - Use ONLY neutral phrasing, e.g., “Based on the patient’s report, symptoms tend to occur during…”
        - Do NOT list any medical conditions.

        Plan:
        - ONLY include plan items explicitly stated by the doctor.
        - If the doctor did not provide specific next steps, write:
        “No specific plan was discussed in this conversation.”

        Your output MUST stay strictly faithful to the transcript with zero added content.`;

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
	const WS_URL = "ws://127.0.0.1:8000/ws";

	const [recordingState, setRecordingState] = useState<RecordingState>("idle");

	const [patientName, setPatientName] = useState("");
	const [dateTime, setDateTime] = useState<Dayjs | null>(dayjs());

	const [transcript, setTranscript] = useState("");
	const [summary, setSummary] = useState("");
	const [summaryHtml, setSummaryHtml] = useState("");

	const [isLoading, setIsLoading] = useState(false); // Loading state for summary
	const hasStarted = useRef(false); // ref to check if recording has started summarizing (more of a safe-guard to remove the loading spinner)

	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

	const [currentlyUsedModel, setCurrentlyUsedModel] = useState<string>("");

	const [selectedTranscriptionModel, setSelectedTranscriptionModel] = useState<string>("small");

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [selectedMicrophoneDeviceId, setSelectedMicrophoneDeviceId] = useState<number | null>(null);

	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

	const [prompt, setPrompt] = useState<string> (initialPrompt);

	// Create websocket - There will be one web socket for both transcription and summarization
	// This is to save on memory and latency (multiplexing)
	const { sendJsonMessage, lastJsonMessage, readyState } =
		useWebSocket<WSMessage>(WS_URL, {
			share: false,
			shouldReconnect: () => true,
		});

	const handleStartRecording = () => {
		if (readyState !== ReadyState.OPEN) return;
		if (recordingState !== "idle") return;

		// validation
		if (!selectedTranscriptionModel) {
			setErrorMessage("Please select a transcription model in settings.");
			return;
		}

		if (!currentlyUsedModel) {
			setErrorMessage("Please select a summarization model in settings.");
			return;
		}

		if (selectedMicrophoneDeviceId === null) {
			setErrorMessage("Please select a microphone in settings.");
			return;
		}

		sendJsonMessage({
			type: "start_transcription",
			model: selectedTranscriptionModel,
			device_id: selectedMicrophoneDeviceId
		});
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

	const handleSetModel = (model_name: string) => {
		setCurrentlyUsedModel(model_name)
	}

	const isSummaryDisabled = () => {
		return isRecording === true || isGeneratingSummary === true || currentlyUsedModel === "" || prompt === "" || transcript === "";
	}

	useEffect(() => {
		if (!lastJsonMessage) return;

		switch (lastJsonMessage.type) {
			case "transcription_token": {
				const { type, text } = lastJsonMessage.payload;

				if (type === "partial") {
					setTranscript((prev) => prev + text + " ");
				}

				if (type === "final") {
					setTranscript((prev) => prev + "\n" + text + "\n");
				}

				break;
			}

			case "summary_token":
				// get the payload, and add it to the text area for the summary
				if (hasStarted.current === true) {
					hasStarted.current = false;
					setIsLoading(false);
				}
				setSummary((s) => s + lastJsonMessage.payload);
				break;
			case "summary_token_end":
				setIsGeneratingSummary(false);
				break;
		}
	}, [lastJsonMessage]);

	const handleSummarizeClick = () => {
		if (recordingState === "recording") return;
		if (readyState !== ReadyState.OPEN) return;

		sendJsonMessage({
			type: "transcription_chunk",
			payload: {
				raw_text: transcript,
				prompt: prompt,
				model_name: currentlyUsedModel,
				service_name: "llama.cpp",
				model_path: '/Users/jaydenferrer/Desktop/test_models/'
			},
		});

		hasStarted.current = true;
		setIsLoading(true);
		setIsGeneratingSummary(true);
	};

	const isRecording = recordingState === "recording";

	return (
		<div className="app-container">
			{/* Header */}
			<div className="top-level-header">
				<div style={{ display: "flex" }}>
					<PatientName value={patientName} onChange={setPatientName} />
					<NewSessionButton isRecording={isRecording} />
				</div>

				<div className="main-options">

				<div
					style={{
						display: "flex",
						gap: "8px",
						justifyContent: "center",
						alignItems: "center",
						flex: 1
					}}
				>
					<Chip
						size="small"
						label={`Speech: ${selectedTranscriptionModel}`}
					/>

					<Chip
						size="small"
						label={`Summary: ${currentlyUsedModel || "None"}`}
					/>

				</div>

					<button
						style={{
							backgroundColor: "transparent",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "4px",
						}}
						onClick={() => setIsSettingsModalOpen(true)}
						title="Open settings"
					>
						<SettingsIcon sx={{ fontSize: 24, color: "#333" }} />
					</button>
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
				<Calendar value={dateTime} onChange={setDateTime} />

				<div className="main-options">
					{/* <SelectModelOptions currentlyUsedModel = {currentlyUsedModel}  handleSetModel={handleSetModel}/> */}
					<ExportButton
						htmlContent={summaryHtml}
						patientName={patientName}
						dateTime={dateTime?.format("MMMM D, YYYY h:mm A") ?? ""}
					/>
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
					setHtmlContent={setSummaryHtml}
					isRecording={isRecording}
					isLoading={isLoading}
					placeHolder="Summary..."
				/>
			</div>

			{/* Footer */}
			{/* IF WE WANT THE PROMPT TO STAY ON THE MAIN SCREEN, KEEP THIS HERE */}
			{
			// 	<div className="footer">
			// 	<CustomPrompt isLoading={isLoading} prompt={prompt} setPrompt={setPrompt}/>
			// 	<button
			// 			className={`summarize-button ${isSummaryDisabled() ? "summarize-button-off" : "summarize-button-on"}`}
			// 			onClick={handleSummarizeClick}
			// 			disabled={isSummaryDisabled()}
			// 			type="button"

			// 		>
			// 			<b>SUMMARIZE</b>
			// 			<AutoAwesomeIcon />
			// 	</button>
			// 	{/* <img src={logo} alt="Pulse Notes Logo" /> */}
			// </div>
			}

		<SettingsModal
			open={isSettingsModalOpen}
			onClose={() => setIsSettingsModalOpen(false)}
			selectedTranscriptionModel={selectedTranscriptionModel}
			onTranscriptionModelChange={setSelectedTranscriptionModel}
			selectedSummarizationModel={currentlyUsedModel} // note we might want to change the name of this for better readability
			// this is specifically the currentlyUsed for summarization
			onSummarizationModelChange={setCurrentlyUsedModel}
			prompt={prompt}
			onPromptChange={setPrompt}
			selectedMicrophoneDeviceId={selectedMicrophoneDeviceId}
			onMicrophoneChange={setSelectedMicrophoneDeviceId}
		/>

		<Snackbar
			open={errorMessage !== null}
			autoHideDuration={4000}
			onClose={() => setErrorMessage(null)}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert
				onClose={() => setErrorMessage(null)}
				severity="error"
				variant="filled"
			>
				{errorMessage}
			</Alert>
		</Snackbar>

		</div>
	);
}

export default TranscriptionPage;
