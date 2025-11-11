import { useState, useEffect, useMemo } from "react";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import "../assets/styles/globals.css";

export default function Timer(props: {isRecording: boolean, recordingStarted: boolean}) {

	const [time, setTime] = useState(0); 
	
	useEffect(() => {

		let interval: NodeJS.Timer | undefined;

		if(props.isRecording)
		{
			interval = setInterval(() => {	
				// useEffect takes a "screen-shot" of the variables and uses that, so if we use something like (time + 1)
				// it will use that same 'time' state value and since useEffect only changes on the dependency list (isRecording and recordingStarted)
				// this means that it will stay the same untill we pause and resume again
				setTime(prev => prev + 1);
			}, 1000);
		}
		else if (props.isRecording === false && props.recordingStarted === true)
		{
            clearInterval(interval);
        }

		// When the component unmounts we want to remove the interval, so it doesnt keep running
        return () => {
            clearInterval(interval);
        };
    }, [props.isRecording, props.recordingStarted]);


	// Convert time from seconds to 00:00:00 format
	const timeFormatted = useMemo(() => {

		const hours = Math.floor(time / 3600);

		const minutes = Math.floor((time % 3600) / 60);

		const seconds = time % 60;

		return (`${formatToTwoDigits(hours)}:${formatToTwoDigits(minutes)}:${formatToTwoDigits(seconds)}`);

	}, [time]);

	function formatToTwoDigits(num: number): string {
		return num.toString().padStart(2, '0');
	}

	return (
		<div className="timer">
			<TimerOutlinedIcon />
			<p>{timeFormatted}</p>
		</div>
	);
}
