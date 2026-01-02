import "../assets/styles/globals.css";

type TextFieldProps = {
	text: string;
	handleTextChange: (text: string) => void;
	isRecording: boolean;
	isLoading?: boolean;
	placeHolder: string;
};

export default function TextField({
	text,
	handleTextChange,
	isRecording,
	isLoading,
	placeHolder,
}: TextFieldProps) {
	return (
		<div className="text-area-container">
			<textarea
				className={`text-area ${isRecording ? "disabled" : ""} ${isLoading ? "summary-loading disabled" : ""}`}
				placeholder={isLoading ? 'Generating Summary...' : placeHolder}
				value={text}
				onChange={(e) => handleTextChange(e.target.value)}
				disabled={isRecording || isLoading}
			/>
		</div>
	);
}
