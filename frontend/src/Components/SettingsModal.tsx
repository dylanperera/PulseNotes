import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import { useState, useEffect } from "react";
import { type SuccessDTO } from "../dtos/BaseResponse";
import { type ModelAvailabilityDTO } from "../dtos/ModelAvailabilityDTO";
import { type DeleteResponseDTO } from "../dtos/DeleteResponseDTO";
import { type DownloadResponseDTO } from "../dtos/DownloadResponseDTO";
import CustomModal from "./Modal";
import { Chip, ListItemText, Tooltip } from "@mui/material";
import CustomPrompt from "./CustomPrompt";
import SelectMicrophoneInput from "./SelectMicrophoneInput";

const END_POINT_URL = "http://127.0.0.1:8000";
const PATH = "/Users/jaydenferrer/Desktop/test_models"; // TODO: Make this dynamic

type ModalState = "confirm" | "loading" | "success" | "closed";

type SettingsModalProps = {
	open: boolean;
	onClose: () => void;
	selectedTranscriptionModel: string;
	onTranscriptionModelChange: (model: string) => void;
	selectedSummarizationModel: string;
	onSummarizationModelChange: (model: string) => void;

	prompt: string;
	onPromptChange: (prompt: string) => void;

	selectedMicrophoneDeviceId: number | null;
	onMicrophoneChange: (deviceId: number | null) => void;
};

const modalStyle = {
	position: "absolute" as const,
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 600,
	bgcolor: "background.paper",
	border: "2px solid #000",
	borderRadius: "8px",
	boxShadow: 24,
	p: 4,
	maxHeight: "80vh",
	overflowY: "auto" as const,
};

const sectionStyle = {
	marginBottom: 3,
};

const labelStyle = {
	fontWeight: "bold",
	marginBottom: 1.5,
	display: "block",
	fontSize: "16px",
};

const descriptionStyle = {
	fontSize: "12px",
	color: "#666",
	marginTop: "4px",
};

const modelListStyle = {
	backgroundColor: "#f5f5f5",
	borderRadius: "4px",
	padding: "12px",
	marginTop: "12px",
};

const modelItemStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	padding: "8px 0",
	borderBottom: "1px solid #ddd",
	"&:last-child": {
		borderBottom: "none",
	},
};

export default function SettingsModal({
	open,
	onClose,
	selectedTranscriptionModel,
	onTranscriptionModelChange,
	selectedSummarizationModel,
	onSummarizationModelChange,
	prompt,
	onPromptChange,
	selectedMicrophoneDeviceId,
	onMicrophoneChange,
}: SettingsModalProps) {
	const [transcriptionModels, setTranscriptionModels] = useState<ModelAvailabilityDTO[]>([]);
	const [summarizationModels, setSummarizationModels] = useState<ModelAvailabilityDTO[]>([]);

	// Modal states for download/delete
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [downloadModalOpen, setDownloadModalOpen] = useState(false);
	const [modelModalState, setModelModalState] = useState<ModalState>("closed");
	const [modelToDelete, setModelToDelete] = useState("");
	const [modelToDownload, setModelToDownload] = useState("");
	const [deleteModelModalText, setDeleteModelModalText] = useState(
		"Deleting a model means removing it from your device. Press confirm to remove model from device."
	);
	const [downloadModelModalStatusText, setDownloadModelModalStatusText] = useState(
		"If you would like to download this model, please press the button below to start the download process"
	);

	useEffect(() => {
		if (open) {
			fetchModels();
		}
	}, [open]);

	const fetchModels = async () => {
	try {
		const response = await axios.get<SuccessDTO<ModelAvailabilityDTO[]>>(
		`${END_POINT_URL}/models`
		);

		const models = response.data.result;

		const transcription = models.filter(
		(m) => m.model_type === "transcription"
		);

		const summarization = models.filter(
		(m) => m.model_type === "summarization"
		);

		setTranscriptionModels(transcription);
		setSummarizationModels(summarization);

		const selectedTranscriptionStillExists = transcription.some(
		(m) =>
			m.model_download_name === selectedTranscriptionModel && m.downloaded
		);

		if (!selectedTranscriptionStillExists) {
		onTranscriptionModelChange("");
		}

		const selectedSummarizationStillExists = summarization.some(
		(m) =>
			m.model_download_name === selectedSummarizationModel && m.downloaded
		);

		if (!selectedSummarizationStillExists) {
		onSummarizationModelChange("");
		}

	} catch (error) {
		console.error("Failed to fetch models:", error);
	}
	};

	const deleteModel = async (modelName: string, path: string) => {
		try {
			await axios.delete<SuccessDTO<DeleteResponseDTO>>(
				`${END_POINT_URL}/models/delete`,
				{ params: { model_name: modelName } }
			);
			setDeleteModelModalText("Successfully removed model from device");
			fetchModels();
		} catch (error: any) {
			const err = error.response?.data as any;
			setDeleteModelModalText(err?.message || "Unable to delete model");
		} finally {
			setModelModalState("success");
		}
	};

	const downloadModel = async (modelName: string, path: string) => {
		try {
			setDownloadModelModalStatusText("Downloading... this may take a few minutes");
			setModelModalState("loading");
			await axios.post<SuccessDTO<DownloadResponseDTO>>(
				`${END_POINT_URL}/models/download`,
				null,
				{ params: { model_name: modelName } }
			);
			setDownloadModelModalStatusText("Successfully downloaded model");
			fetchModels();
		} catch (error: any) {
			const err = error.response?.data?.detail as any;
			setDownloadModelModalStatusText(err?.message || "Unable to download model");
		} finally {
			setModelModalState("success");
		}
	};

	const handleDeleteClick = (modelName: string) => {
		setModelToDelete(modelName);
		setModelModalState("confirm");
		setDeleteModalOpen(true);
	};

	const handleDownloadClick = (modelName: string) => {
		setModelToDownload(modelName);
		setModelModalState("confirm");
		setDownloadModalOpen(true);
	};

	const handleDeleteModalClose = () => {
		if (modelModalState === "loading") return;
		setDeleteModalOpen(false);
		setModelModalState("closed");
		setDeleteModelModalText("Deleting a model means removing it from your device. Press confirm to remove model from device.");
	};

	const handleDownloadModalClose = () => {
		if (modelModalState === "loading") return;
		setDownloadModalOpen(false);
		setModelModalState("closed");
		setDownloadModelModalStatusText("If you would like to download this model, please press the button below to start the download process");
	};

	const getModelStatus = (model: ModelAvailabilityDTO) => {
		if (!model.usable_now) {
			return { label: "Unsupported", color: "default" as const };
		}

		if (!model.downloaded) {
			return { label: "Download Required", color: "warning" as const };
		}

		return { label: "Ready", color: "success" as const };
	};


	return (
		<Modal
			open={open}
			onClose={onClose}
			aria-labelledby="settings-modal-title"
			aria-describedby="settings-modal-description"
		>
			<Box sx={modalStyle}>
				<CustomModal
					open={deleteModalOpen}
					onHandleClose={handleDeleteModalClose}
					nextStepButtonName="Delete Model"
					nextStepCallback={async () => deleteModel(modelToDelete, PATH)}
					modalTitle="Confirm to Delete Model"
					modalText={deleteModelModalText}
					modalState={modelModalState}
					primaryButtonColor="error"
				/>
				<CustomModal
					open={downloadModalOpen}
					onHandleClose={handleDownloadModalClose}
					nextStepButtonName="Download Model"
					nextStepCallback={async () => downloadModel(modelToDownload, PATH)}
					modalTitle="Confirm to Download Model"
					modalText={downloadModelModalStatusText}
					modalState={modelModalState}
					primaryButtonColor="primary"
				/>

				<Typography id="settings-modal-title" variant="h4" component="h2" sx={{ marginBottom: 3 }}>
					Settings
				</Typography>

				{/* Microphone Selection */}
				<Box sx={sectionStyle}>
					<FormLabel sx={labelStyle}>Microphone</FormLabel>
					<SelectMicrophoneInput
						selectedDeviceId={selectedMicrophoneDeviceId}
						onDeviceChange={onMicrophoneChange}
					/>
				</Box>

				{/* Transcription Model Selection */}
				<Box sx={sectionStyle}>
					<FormLabel sx={labelStyle}>Transcription Models</FormLabel>
					<Select
						fullWidth
						value={selectedTranscriptionModel ?? ""}
						onChange={(e) => {
							const selected = transcriptionModels.find(
							(m) => m.model_download_name === e.target.value
							);

							if (!selected?.downloaded) return;

							onTranscriptionModelChange(e.target.value);
						}}
						sx={{ marginBottom: 1 }}
						>
							{transcriptionModels.map((model) => {
								const fauxDisabled = !model.usable_now;

								const tooltip =
									!model.usable_now
										? model.reason
										: !model.downloaded
										? "Download model to use"
										: "Delete model from device";

								const status =
									!model.usable_now
										? { label: "Unsupported", color: "default" as const }
										: !model.downloaded
										? { label: "Download Required", color: "warning" as const }
										: { label: "Ready", color: "success" as const };

								return (
									<MenuItem
										key={model.model_download_name}
										value={model.model_download_name}
										sx={{
											opacity: fauxDisabled ? 0.5 : 1,
											cursor: fauxDisabled ? "not-allowed" : "pointer",
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}>
										<ListItemText
											primary={model.model_display_name}
											secondary={
												<Box>
													<Typography variant="body2">
														{model.model_description}
													</Typography>

													{!model.usable_now && (
														<Typography
															variant="caption"
															sx={{ color: "error.main", display: "block" }}
														>
															{model.reason}
														</Typography>
													)}
												</Box>
											}
										/>

											<Chip size="small" label={status.label} color={status.color} />

											{/* DOWNLOAD ICON */}
											{!model.downloaded && model.supported && model.usable_now && (
												<Tooltip title="Download model to use" arrow>
													<IconButton
														size="small"
														onMouseDown={(e) => {
															e.stopPropagation();
															e.preventDefault();
														}}
														onClick={(e) => {
															e.stopPropagation();
															e.preventDefault();
															handleDownloadClick(model.model_download_name);
														}}
													>
														<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
													</IconButton>
												</Tooltip>
											)}

											{/* DELETE ICON */}
											{model.downloaded && (
												<Tooltip title="Delete model from device" arrow>
													<IconButton
														size="small"
														onMouseDown={(e) => {
															e.stopPropagation();
															e.preventDefault();
														}}
														onClick={(e) => {
															e.stopPropagation();
															e.preventDefault();
															handleDeleteClick(model.model_download_name);
														}}
													>
														<DeleteOutlinedIcon sx={{ fontSize: 18 }} />
													</IconButton>
												</Tooltip>
											)}
										</Box>
									</MenuItem>
								);
							})}
						</Select>
				</Box>

				{/* Summarization Model Selection */}
				<Box sx={sectionStyle}>
					<FormLabel sx={labelStyle}>Summarization Models</FormLabel>
					<Select
						fullWidth
						value={selectedSummarizationModel ?? ""}
						onChange={(e) => {
							const selected = summarizationModels.find(
							(m) => m.model_download_name === e.target.value
							);

							if (!selected?.downloaded) return;

							onSummarizationModelChange(e.target.value);
						}}
						sx={{ marginBottom: 1 }}
						>
						{summarizationModels.map((model) => {
							const fauxDisabled = !model.usable_now;

							const tooltip =
								!model.usable_now
									? model.reason
									: !model.downloaded
									? "Download model to use"
									: "Delete model from device";

							const status =
								!model.usable_now
									? { label: "Unsupported", color: "default" as const }
									: !model.downloaded
									? { label: "Download Required", color: "warning" as const }
									: { label: "Ready", color: "success" as const };

							return (
								<MenuItem
								key={model.model_download_name}
								value={model.model_download_name}
								sx={{
									opacity: fauxDisabled ? 0.5 : 1,
									cursor: fauxDisabled ? "not-allowed" : "pointer",
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}>
									<ListItemText
									primary={model.model_display_name}
									secondary={
										<Box>
											<Typography variant="body2">
												{model.model_description}
											</Typography>

											{!model.usable_now && (
												<Typography
													variant="caption"
													sx={{ color: "error.main", display: "block" }}
												>
													{model.reason}
												</Typography>
											)}
										</Box>
									}
								/>

									<Chip size="small" label={status.label} color={status.color} />

									{/* DOWNLOAD ICON */}
									{!model.downloaded && model.supported && model.usable_now && (
										<Tooltip title="Download model to use" arrow>
											<IconButton
												size="small"
												onMouseDown={(e) => {
													e.stopPropagation();
													e.preventDefault();
												}}
												onClick={(e) => {
													e.stopPropagation();
													e.preventDefault();
													handleDownloadClick(model.model_download_name);
												}}
											>
												<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
											</IconButton>
										</Tooltip>
									)}

									{/* DELETE ICON */}
									{model.downloaded && (
										<Tooltip title="Delete model from device" arrow>
											<IconButton
												size="small"
												onMouseDown={(e) => {
													e.stopPropagation();
													e.preventDefault();
												}}
												onClick={(e) => {
													e.stopPropagation();
													e.preventDefault();
													handleDeleteClick(model.model_download_name);
												}}
											>
												<DeleteOutlinedIcon sx={{ fontSize: 18 }} />
											</IconButton>
										</Tooltip>
									)}
								</Box>
							</MenuItem>
							);
						})}
						</Select>

				</Box>

				{/* Custom Prompt Input */}
				<Box sx={sectionStyle}>
					<FormLabel sx={labelStyle}>Summarization Prompt</FormLabel>

					<CustomPrompt
						isLoading={false}
						prompt={prompt}
						setPrompt={onPromptChange}
					/>

					<Typography sx={descriptionStyle}>
						This prompt controls how the summarization model generates the SOAP note.
					</Typography>
				</Box>
				{/* Close Button */}
				<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 4 }}>
					<Button
						style={{ color: "black", borderColor: "black", fontWeight: "bold" }}
						onClick={onClose}
					>
						Close
					</Button>
				</Box>
			</Box>
		</Modal>
	);
}
