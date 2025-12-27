import { PlayCircleFilledRounded } from "@mui/icons-material";
import Button from "@mui/material/Button";

export default function ResumeUI(props: { handleIsRecording: () => void }) {
	return (
		<Button
			id="demo-customized-button"
			variant="contained"
			disableElevation
			onClick={props.handleIsRecording}
			sx={{
				backgroundColor: "rgba(25,163,74,0.94)",
				color: "white",
				"&:hover": {
					backgroundColor: "rgba(20, 130, 60, 0.94)",
				},
				border: "2px solid rgba(244,233,222,1)",
			}}
		>
			<PlayCircleFilledRounded /> <b style={{ marginLeft: "8px" }}>Resume</b>
		</Button>
	);
}
