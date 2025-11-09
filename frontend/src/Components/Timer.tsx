import React from "react";
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import "../assets/styles/globals.css"

export default function Timer(props: {isRecording: boolean}){
    return (
        <div className="timer">
            <TimerOutlinedIcon />
            <p>00:00:00</p>
        </div>
    )
}