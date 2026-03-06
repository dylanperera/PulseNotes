import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import spinner from "../assets/images/spinner.svg";

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

// The modal should recieve:
// 1. The open state from the parent
// 2. handleOpen and handleClose functions
// 3. the two button names
// 4. text to display in the modal
// 5. functions to call for the first button
// 6. colour of the first button
type ModalState = "confirm" | "loading" | "success" | "closed";

type ModalProps = {
  open: boolean;
  onHandleClose: () => void;
  nextStepButtonName: string;
  nextStepCallback: () => void | Promise<void>;
  modalTitle: string;
  modalText: string;
  modalState: ModalState;
  primaryButtonColor: string;
};

export default function CustomModal({ open, onHandleClose, nextStepButtonName, nextStepCallback, modalText, modalTitle, modalState, primaryButtonColor}: ModalProps)
{

    return (
        <Modal
				open={open}
				onClose={onHandleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                                <b> {modalTitle} </b>
                    </Typography>
                    { modalState === "loading" && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "1rem",
                                paddingTop: "2.5rem",
                                paddingBottom: "2rem"
                            }}
                        >
                            <img src={spinner} alt="Spinner" />
                        </div>
                    )}
                    <Typography
                        id="modal-modal-description"
                        sx={{ mt: 1, mb: 3.5, color: "text.secondary" }}
                    >
                        { modalText }
                    </Typography>

                    { modalState === "confirm" && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "1rem",
                                }}
                            >
                                <Button
                                    onClick={() => nextStepCallback()}
                                    variant="contained"
                                    color={primaryButtonColor === "primary" ? "primary" : "error"}
                                    disableElevation
                                >
                                    <b>{nextStepButtonName}</b>
                                </Button>
                                <Button
                                    onClick={onHandleClose}
                                    sx={{
                                        color: "black",
                                        padding: "0.5rem",
                                        "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
                                    }}
                                >
                                    <b>Cancel</b>
                                </Button>
                            </div>
                    )}

                    { modalState === "success" && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "1rem",
                            }}
                        >
                            <Button
                                onClick={onHandleClose}
                                sx={{
                                    color: "black",
                                    padding: "0.5rem",
                                    "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
                                }}
                            >
                                <b>Close</b>
                            </Button>
                        </div>
                    )}
                </Box>
		</Modal>
    )
}