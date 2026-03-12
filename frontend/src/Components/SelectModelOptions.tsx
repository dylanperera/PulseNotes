import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from '@mui/material/ListSubheader';
import { alpha, styled } from "@mui/material/styles";
import axios from "axios";
import { useState, useEffect, MouseEvent, useMemo } from "react";
import { app } from "electron"
import { type ErrorDTO, SuccessDTO } from "../dtos/BaseResponse"
import { type ModelAvailabilityDTO } from "../dtos/ModelAvailabilityDTO"
import { type DeleteResponseDTO } from "../dtos/DeleteResponseDTO"
import { type DownloadResponseDTO } from "../dtos/DownloadResponseDTO"
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CustomModal from "./Modal";

{/*NOTE: WE PROBABLY CAN REMOVE THIS... I GOT RID OF IT */}

// TODO: CHANGE THESE
const END_POINT_URL = "http://127.0.0.1:8000";
const PATH = '/Users/jaydenferrer/Desktop/test_models';


const StyledListHeader = styled(ListSubheader)(({ theme }) => ({
  backgroundImage: 'var(--Paper-overlay)',
  // Reduce vertical padding for less whitespace around categories
  lineHeight: theme.spacing(4),
  paddingTop: 0,
  paddingBottom: 0,
  marginTop: 0,
  marginBottom: 0,
  fontSize: 16
}))

const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{
			vertical: "bottom",
			horizontal: "right",
		}}
		transformOrigin={{
			vertical: "top",
			horizontal: "right",
		}}
		{...props}
	/>
))(({ theme }) => ({
	"& .MuiPaper-root": {
		borderRadius: 6,
		marginTop: theme.spacing(1),
		minWidth: 180,
		color: "rgb(33, 63, 33)",
		boxShadow:
			"rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
		"& .MuiMenu-list": {
			padding: "4px 0",
		},
		"& .MuiMenuItem-root": {
			"& .MuiSvgIcon-root": {
				fontSize: 18,
				color: theme.palette.text.secondary,
				marginRight: theme.spacing(1.5),
				...theme.applyStyles("dark", {
					color: "inherit",
				}),
			},
			"&:active": {
				backgroundColor: alpha(
					theme.palette.primary.main,
					theme.palette.action.selectedOpacity,
				),
			},
		},
		...theme.applyStyles("dark", {
			color: theme.palette.grey[300],
		}),
	},
}));

type ModalState = "confirm" | "loading" | "success" | "closed";

type selectModelProps = {
	currentlyUsedModel: string;
	handleSetModel:  (model_name: string) => void;
}

export default function SelectModelOptions({currentlyUsedModel, handleSetModel}: selectModelProps) {

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const [modalState, setModalState] = useState<ModalState>("closed");

	// Everything related to the delete modal
	const [deleteModelModalText, setDeleteModelModalText] = useState("Deleting a model means removing it from your device. Press confirm to remove model from device. This model can later be downloaded again when connected to internet");
	const [modelToDelete, setModelToDelete] = useState("");
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const handleDeleteModalOpen = () => {
		setModalState("confirm")
		setDeleteModalOpen(true);
	}
	const handleDeleteModalClose = () => {
		setDeleteModalOpen(false);
		setModalState("closed");
		setDeleteModelModalText("Deleting a model means removing it from your device. Press confirm to remove model from device. This model can later be downloaded again when connected to internet");
	}

	const [downloadModelModalStatusText, setDownloadModelModalStatusText] = useState("If you would like to download this model, please press the button below to start the download process");
	const [modelToDownload, setModelToDownload] = useState("");
	const [downloadModalOpen, setDownloadModalOpen] = useState(false);
	const handleDownloadModalOpen = () => {
		setModalState("confirm")
		setDownloadModalOpen(true);
	}
	const handleDownloadModalClose = () => {
		if(modalState === "loading")
			return;

		setDownloadModalOpen(false);
		setModalState("closed");
		setDownloadModelModalStatusText("If you would like to download this model, please press the button below to start the download process");
	}


	const handleClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleStart = (modelName: string) => {
		handleSetModel(modelName);
		setAnchorEl(null);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const [userDataPath, setUserDataPath] = useState("");

	const [models, setModels] = useState<ModelAvailabilityDTO[]>([]);

	// Need 3 computed values based off of the state above:
	// one for the available
	const downloadedModels: ModelAvailabilityDTO[] = useMemo(() => {
		return models.filter(model => model.downloaded === true)
	}, [models]);

	// one for the currently unavailable
	const modelsToDownload: ModelAvailabilityDTO[] = useMemo(() => {
		return models.filter(model => model.supported === true && model.downloaded === false)
	}, [models]);

	// one for the unsupported
	const unsupportedModels: ModelAvailabilityDTO[] = useMemo(() => {
		return models.filter(model => model.supported === false)
	}, [models]);

	useEffect(() => {

		fetchModels();
	},
	[]);

	const fetchModels = async () => {
		try {
			const url = `${END_POINT_URL}/models`
			const response = await axios.get<SuccessDTO<ModelAvailabilityDTO[]>>(url, { params: {"path":PATH}} )

			setModels(response.data.result);

		} catch (error: any) {
			const err: ErrorDTO | undefined = error;

			console.log(err);
		}
	};

	// Endpoint call to delete the model from the device
	const deleteModel = async (modelName: string, path: string) => {

		try {
			// Try to delete the model
			const url = `${END_POINT_URL}/models/delete?model_name=${modelName}&path=${path}`;

			await axios.delete<SuccessDTO<DeleteResponseDTO>>(url);

			setDeleteModelModalText("Successfully removed model from device")

			fetchModels();
		} catch (error: any) {
    		const err = error.response?.data as ErrorDTO | undefined;

			if(err === undefined)
				setDeleteModelModalText("Unable to download model");
			else
				setDeleteModelModalText(err.message);
		} finally {
			setModalState("success");
		}
	}

	const downloadModel = async (modelName: string, path: string) => {
		try {

			setDownloadModelModalStatusText("Downloading... this may take a few minutes");
			setModalState("loading");

			const url = `${END_POINT_URL}/models/download?model_name=${modelName}&path=${path}`;

			await axios.get<SuccessDTO<DownloadResponseDTO>>(url);

			setDownloadModelModalStatusText("Successfully downloaded model");

			fetchModels();
		} catch (error: any) {
    		const err = error.response?.data.detail as ErrorDTO | undefined;


			if(err === undefined)
				setDownloadModelModalStatusText("Unable to download model");
			else
				setDownloadModelModalStatusText(err.message);
		} finally {
			setModalState("success");
		}
	}

	return (
		<div className="model-select">
			<CustomModal open={deleteModalOpen}
						 onHandleClose={handleDeleteModalClose}
						 nextStepButtonName="Delete Model"
						 nextStepCallback={async () => deleteModel(modelToDelete, PATH)}
						 modalTitle="Confirm to Delete Model"
						 modalText={deleteModelModalText}
						 modalState={modalState}
						 primaryButtonColor="error"
			/>

			<CustomModal open={downloadModalOpen}
						 onHandleClose={handleDownloadModalClose}
						 nextStepButtonName="Download Model"
						 nextStepCallback={async () => downloadModel(modelToDownload, PATH)}
						 modalTitle="Confirm to Download Model"
						 modalText={downloadModelModalStatusText}
						 modalState={modalState}
						primaryButtonColor="primary"
			/>

			<Button
				id="demo-customized-button"
				aria-controls={open ? "demo-customized-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				variant="contained"
				disableElevation
				onClick={handleClick}
				endIcon={<KeyboardArrowDownIcon />}
				sx={{
					backgroundColor: "rgb(20, 20, 20)",
					color: "white",
					"&:hover": {
						backgroundColor: "rgb(40, 40, 40)",
					},
				}}
			>
				<b style={{ marginLeft: "8px" }}>Model{ currentlyUsedModel !== "" ? `: ${currentlyUsedModel}` : ''}</b>
			</Button>
			<StyledMenu
			id="demo-customized-menu"
			anchorEl={anchorEl}
			open={open}
			onClose={handleClose}
			slotProps={{
				paper: {
				sx: {
					maxHeight: 200,   // adjust as needed
					overflowY: "scroll",
				},
				},
				list: {
				"aria-labelledby": "demo-customized-button",
				},
			}}
			>
				<StyledListHeader disableSticky>Ready to Use</StyledListHeader>
				{
					downloadedModels.map(model => {
						return (
							<Tooltip title={model.reason} arrow
							slotProps={{
								popper: {
								modifiers: [
									{
									name: 'offset',
									options: {
										offset: [0, -20],
									},
									},
								],
								},
								tooltip: {
									sx: {
										fontSize: '0.9rem'
									}
								}
							}}
							placement="right"
							key={model.model_download_name}
							>
								<MenuItem disableRipple key={model.model_download_name}>
									<ListItemText
										onClick={() => {
											// REMOVE IF, TO TEST THE DIFFERENT MODELS THAT DONT FIT
											if(model.reason === "" || model.reason === null)
											{
												handleStart(model.model_download_name);
											}
										}}
										primary= { model.model_download_name }
										// secondary="(Decides how long to think)"
									/>

									<Tooltip title="Delete Model from Device">
										<IconButton sx={{
											'&:hover': {
												backgroundColor: 'rgba(245,39,39,0.32)'
											},
											'borderRadius': '100%'
										}}
										onClick={() => {
											setModelToDelete(model.model_download_name);
											handleDeleteModalOpen();
										}}
										>
											<DeleteOutlinedIcon sx={{
												marginRight: '0 !important'
											}} />
										</IconButton>
									</Tooltip>
								</MenuItem>
							</Tooltip>
						);
					})
				}
				<Divider />
				<StyledListHeader disableSticky>Available to Download</StyledListHeader>
				{
					modelsToDownload.map(model => {
						return (

							<Tooltip title={model.reason} arrow
							slotProps={{
								popper: {
								modifiers: [
									{
									name: 'offset',
									options: {
										offset: [0, -20],
									},
									},
								],
								},
								tooltip: {
									sx: {
										fontSize: '0.9rem'
									}
								}
							}}
							placement="right"
							key={model.model_download_name}
							>
								<div>
									<MenuItem disableRipple>
										<ListItemText
											primary= { model.model_download_name }
											// secondary="(Decides how long to think)"
										/>
										<Tooltip title="Download Model">
											<IconButton sx={{
												'borderRadius': '100%'
											}}
											onClick={() => {
												setModelToDownload(model.model_download_name);
												handleDownloadModalOpen();
											}}
											>
												<FileDownloadOutlinedIcon sx={{
													marginRight: '0 !important'
												}} />
											</IconButton>
										</Tooltip>
									</MenuItem>
								</div>
							</Tooltip>
						);
					})
				}
				<Divider />
				<StyledListHeader>Not Supported</StyledListHeader>
				{
					unsupportedModels.map(model => {
						return (
							<Tooltip title={model.reason} arrow
							slotProps={{
								popper: {
								modifiers: [
									{
									name: 'offset',
									options: {
										offset: [0, -20],
									},
									},
								],
								},
								tooltip: {
									sx: {
										fontSize: '0.9rem'
									}
								}
							}}
							placement="right"
							id={model.model_download_name}
							>
								<div>
									<MenuItem disabled={true}>
									<ListItemText
										primary= { model.model_download_name }
										// secondary="(Decides how long to think)"
									/>
								</MenuItem>
								</div>
							</Tooltip>
							);
					})
				}
			</StyledMenu>
		</div>
	);
}
