import { ChangeEvent, useEffect, useRef } from "react";
import "../assets/styles/globals.css";

type TextFieldProps = {
	text: string;
	setContent: (text: string) => void;
	isRecording: boolean;
	isLoading?: boolean
	placeHolder: string;
	id: string;
};

export default function TextField({
	text,
	setContent,
	isRecording,
	isLoading,
	placeHolder,
	id
}: TextFieldProps) {

	const textArea = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if(textArea.current)
			textArea.current.scrollTop = textArea.current.scrollHeight;
	}, [text])

	return (
		<div className="text-area-container">
			<textarea
				id = {id}
				ref = {textArea}
				className={`text-area ${isRecording ? "disabled" : ""} ${isLoading ? "summary-loading disabled" : ""}`}
				placeholder={isLoading ? 'Generating Summary...' : placeHolder}
				value={text}
				onChange={(e) => { setContent(e.target.value) }}
				disabled={isRecording || isLoading}
			/>
		</div>
	);
}
