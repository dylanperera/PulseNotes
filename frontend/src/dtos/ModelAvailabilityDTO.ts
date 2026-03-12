export type ModelAvailabilityDTO = {
	model_download_name: string;
	model_display_name: string;
	model_description: string;
	model_type: "transcription" | "summarization";
	downloaded: boolean;
	supported: boolean;
	usable_now: boolean;
	reason: string;
};
