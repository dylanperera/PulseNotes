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

type AudioDevice = {
	id: number;
	name: string;
	channels: number;
};

type SelectMicrophoneInputProps = {
	selectedDeviceId: number | null;
	onDeviceChange: (deviceId: number | null) => void;
};

export default function SelectMicrophoneInput({
	selectedDeviceId,
	onDeviceChange,
}: SelectMicrophoneInputProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const [devices, setDevices] = useState<AudioDevice[]>([]);
	const [selectedDeviceName, setSelectedDeviceName] = useState<string>(
		"Default Microphone"
	);
	const [loading, setLoading] = useState<boolean>(true);

	// fetch available audio devices on component mount
	useEffect(() => {
		const fetchDevices = async () => {
			try {
				const response = await axios.get<any>(
					`${END_POINT_URL}/audio-devices`
				);

				const deviceList = response.data.result as AudioDevice[];
				setDevices(deviceList);

				// if no device is selected and we have devices, use the first one
				if (selectedDeviceId === null && deviceList.length > 0) {
					onDeviceChange(deviceList[0].id);
					setSelectedDeviceName(deviceList[0].name);
				} else if (selectedDeviceId !== null) {
					// Find the name of the currently selected device
					const selected = deviceList.find((d) => d.id === selectedDeviceId);
					if (selected) {
						setSelectedDeviceName(selected.name);
					}
				}

				setLoading(false);
			} catch (error) {
				console.error("Failed to fetch audio devices:", error);
				setLoading(false);
			}
		};

		fetchDevices();
	}, []);

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelectDevice = (deviceId: number, deviceName: string) => {
		onDeviceChange(deviceId);
		setSelectedDeviceName(deviceName);
		handleClose();
	};

	const handleDefaultMicrophone = () => {
		onDeviceChange(null);
		setSelectedDeviceName("Default Microphone");
		handleClose();
	};

	return (
		<div>
			<Button
				id="customize-button"
				aria-controls={open ? "customize-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				variant="text"
				disableElevation
				onClick={handleClick}
				endIcon={<KeyboardArrowDownIcon />}
				sx={{
					color: "rgb(33, 63, 33)",
					"&:hover": {
						backgroundColor: "rgba(233, 236, 239, 0.4)",
					},
				}}
			>
				{loading ? "Loading..." : selectedDeviceName}
			</Button>
			<StyledMenu
				id="customize-menu"
				MenuListProps={{
					"aria-labelledby": "customize-button",
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
			>
				<MenuItem
					key="default"
					selected={selectedDeviceId === null}
					onClick={() => handleDefaultMicrophone()}
				>
					Default Microphone
				</MenuItem>
				{devices.map((device) => (
					<MenuItem
						key={device.id}
						selected={selectedDeviceId === device.id}
						onClick={() => handleSelectDevice(device.id, device.name)}
					>
						{device.name}
					</MenuItem>
				))}
			</StyledMenu>
		</div>
	);
}
