import PostAddIcon from "@mui/icons-material/PostAdd";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as React from "react";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "2px solid rgba(226, 215, 201, 0.8);",
	borderRadius: "16px",
	boxShadow: "0px 8px 24px rgba(0,0,0,0.18)",
	backgroundColor: "white",
	p: 3,
};

export default function NewSessionButton(props: { isRecording: boolean }) {
	const [open, setOpen] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

    const handleNewSession = () => {
        window.location.reload();
    }


	if (props.isRecording) return null;
    return (
        <div style={{ marginTop: "1.3rem" }}>
            <Tooltip title="Click to Open New Session">
                <Button onClick={handleOpen}>
                    <PostAddIcon sx={{ color: "#2EB7B6" }} />
                </Button>
            </Tooltip>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        <b>Confirm to Start a New Session</b>
                    </Typography>
                    <Typography
                        id="modal-modal-description"
                        sx={{ mt: 1, mb: 3.5, color: "text.secondary" }}
                    >
                        All notes, transcripts, and documents tied to this session will be
                        permanently removed.
                    </Typography>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "1rem",
                        }}
                    >
                        <Button onClick={handleNewSession} variant="contained" color="error" disableElevation>
                            <b>Delete Session</b>
                        </Button>
                        <Button
                            onClick={handleClose}
                            sx={{
                                color: "black",
                                padding: "0.5rem",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
                            }}
                        >
                            <b>Cancel</b>
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}
