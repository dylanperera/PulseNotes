import PostAddIcon from "@mui/icons-material/PostAdd";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useState } from 'react';
import CustomModal from "./Modal";

type ModalState = "confirm" | "closed";


export default function NewSessionButton(props: { isRecording: boolean }) {
	const [open, setOpen] = useState(false);
	const [modalState, setModalStateOpen] = useState<ModalState>("closed");

	const handleOpen = () => {
		setModalStateOpen("confirm");
		setOpen(true);
	}
	const handleClose = () => {
		setOpen(false);
		setModalStateOpen("closed");
	}

	const handleNewSession = () => {
		window.location.reload();
	};

	if (props.isRecording) return null;
	return (
		<div style={{ marginTop: "1.3rem" }}>
			<Tooltip title="Click to Open New Session">
				<Button onClick={handleOpen}>
					<PostAddIcon sx={{ color: "#2EB7B6" }} />
				</Button>
			</Tooltip>
			<CustomModal open={open} 
						 onHandleClose={handleClose} 
						 nextStepButtonName="Delete Session"
						 nextStepCallback={handleNewSession}
						 modalTitle="Confirm to start a new session"
						 modalText="All notes, transcripts, and documents tied to this session will be
						permanently removed."
						modalState={modalState}
			/>
		</div>
	);
}
