import "../assets/styles/globals.css";

type TextFieldProps = {
	text: string;
	handleTextChange: (text: string) => void;
	isRecording: boolean;
	placeHolder: string;
};

export default function TextField({
	text,
	handleTextChange,
	isRecording,
	placeHolder,
}: TextFieldProps) {
	return (
		<div className="text-area-container">
			<textarea
				className={`text-area ${isRecording ? "disabled" : ""}`}
				placeholder={placeHolder}
				value={text}
				onChange={(e) => handleTextChange(e.target.value)}
				disabled={isRecording}
			/>
		</div>
	);
}
