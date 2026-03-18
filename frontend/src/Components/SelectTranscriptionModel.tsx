import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { alpha, styled } from "@mui/material/styles";
import axios from "axios";
import { useState, useEffect, MouseEvent } from "react";
import { type SuccessDTO } from "../dtos/BaseResponse";
import { BACKEND_URL } from "../config";

const END_POINT_URL = BACKEND_URL;

const StyledMenu = styled(Menu)(({ theme }) => ({
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

type TranscriptionModel = {
	name: string;
	description: string;
};

type SelectTranscriptionModelProps = {
	selectedModel: string;
	onModelChange: (model: string) => void;
};

export default function SelectTranscriptionModel({ selectedModel, onModelChange }: SelectTranscriptionModelProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const [models, setModels] = useState<TranscriptionModel[]>([]);

	useEffect(() => {
		const fetchModels = async () => {
			try {
				const response = await axios.get<SuccessDTO<TranscriptionModel[]>>(`${END_POINT_URL}/transcription-models`);
				setModels(response.data.result);
			} catch (error) {
				console.error("Failed to fetch transcription models:", error);
				// Fallback to default models
				setModels([
					{ name: "tiny", description: "Fastest, least accurate" },
					{ name: "base", description: "Fast, moderate accuracy" },
					{ name: "small", description: "Balanced speed and accuracy" },
					{ name: "medium", description: "Slower, higher accuracy" },
					{ name: "large", description: "Slowest, highest accuracy" }
				]);
			}
		};
		fetchModels();
	}, []);

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleModelSelect = (modelName: string) => {
		onModelChange(modelName);
		handleClose();
	};

	return (
		<div>
			<Button
				id="transcription-model-button"
				aria-controls={open ? "transcription-model-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				variant="contained"
				disableElevation
				onClick={handleClick}
				endIcon={<KeyboardArrowDownIcon />}
				sx={{
					backgroundColor: "var(--primary-color)",
					color: "black",
					borderRadius: "20px",
					textTransform: "none",
					fontSize: "14px",
					padding: "6px 16px",
					"&:hover": {
						backgroundColor: "var(--primary-color-hover)",
					},
				}}
			>
				{selectedModel || "Select Model"}
			</Button>
			<StyledMenu
				id="transcription-model-menu"
				MenuListProps={{
					"aria-labelledby": "transcription-model-button",
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				elevation={0}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
			>
				{models.map((model) => (
					<MenuItem
						key={model.name}
						selected={model.name === selectedModel}
						onClick={() => handleModelSelect(model.name)}
					>
						<div>
							<strong>{model.name}</strong>
							<br />
							<small style={{ color: "gray" }}>{model.description}</small>
						</div>
					</MenuItem>
				))}
			</StyledMenu>
		</div>
	);
}