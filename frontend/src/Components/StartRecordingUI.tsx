import MicIcon from "@mui/icons-material/Mic";
import Button from "@mui/material/Button";
import * as React from "react";

export default function StartRecordingUI(props: {
	handleIsRecording: () => void;
	handleStartRecording: () => void;
}) {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
		props.handleStartRecording();
		props.handleIsRecording();
	};

	return (
		<div className="timer">
			<Button
				id="demo-customized-button"
				aria-controls={open ? "demo-customized-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				variant="contained"
				disableElevation
				onClick={handleClick}
				sx={{
					backgroundColor: "rgba(25,163,74,0.94)",
					color: "white",
					"&:hover": {
						backgroundColor: "rgba(20, 130, 60, 0.94)",
					},
				}}
			>
				<MicIcon /> <b style={{ marginLeft: "8px" }}>Start Recording</b>
			</Button>
		</div>
	);
}
