import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import "../assets/styles/globals.css";

export default function Timer(props: { isRecording: boolean }) {
	return (
		<div className="timer">
			<TimerOutlinedIcon />
			<div>hello</div>
			<p>00:00:00</p>
		</div>
	);
}
