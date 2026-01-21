import PauseUI from "./PauseUI";
import ResumeUI from "./ResumeUI";
import StartRecordingUI from "./StartRecordingUI";

type RecordingState = "idle" | "recording" | "paused";

type RecordingOptionsProps = {
	recordingState: RecordingState;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
};

export default function RecordingOptions({
	recordingState,
	onStart,
	onPause,
	onResume,
	onStop,
}: RecordingOptionsProps) {
	switch (recordingState) {
		case "idle":
			return <StartRecordingUI onStart={onStart} />;

		case "recording":
			return <PauseUI onPause={onPause}/>;

		case "paused":
			return <ResumeUI onResume={onResume} />;

		default:
			return <div>Error</div>;
	}
}
