import { PauseCircle } from "@mui/icons-material";
import Button from "@mui/material/Button";

export default function PauseUI(props: { handleIsRecording: () => void }) {
	return (
		<Button
			id="demo-customized-button"
			variant="contained"
			disableElevation
			onClick={props.handleIsRecording}
			sx={{
				backgroundColor: "#fcfaf8",
				transition: "background-color 0.2s ease",
				color: "black",
				"&:hover": {
					backgroundColor: "#e6ddd3",
				},
				"&:active": {
					backgroundColor: "#d9ccc0",
				},
				border: "2px solid rgba(244,233,222,1)",
			}}
		>
			<div className="blinking-dot"></div>
			<PauseCircle /> <b style={{ marginLeft: "8px" }}>Pause</b>
		</Button>
	);
}
