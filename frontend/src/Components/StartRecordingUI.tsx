import MicIcon from "@mui/icons-material/Mic";
import Button from "@mui/material/Button";
import * as React from "react";

type Props = {
	onStart: () => void;
};

export default function StartRecordingUI({ onStart }: Props) {
	const handleClick = () => {
		onStart();
	};

	return (
		<div className="timer">
			<Button
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
				<MicIcon />
				<b style={{ marginLeft: "8px" }}>Start Recording</b>
			</Button>
		</div>
	);
}
