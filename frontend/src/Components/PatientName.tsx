import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import "../assets/styles/globals.css";
import InputAdornment from "@mui/material/InputAdornment";

export default function PatientName() {
	return (
		<div className="patient-name-input">
			<Box
				component="form"
				sx={{ "& > :not(style)": { m: 1, width: "25ch" }}}
				noValidate
				autoComplete="off"
				borderColor="#3AA6A4"
			>
				<TextField
					id="standard-basic"
					label="Patient Name"
					variant="standard"
					slotProps={{
						input: {
						startAdornment: (
							<InputAdornment position="start">
							<PersonOutlineIcon sx={{ color: "#244A82" }}/>
							</InputAdornment>
						),
						},
					}}
					sx={{
						// Focused underline
						"& .MuiInput-underline:after": {
						borderBottomColor: "#3AA6A4",   // your teal
						},
						// Hover underline
						"& .MuiInput-underline:hover:before": {
						borderBottomColor: "#3AA6A4",
						},
						// Label when focused
						"& .MuiInputLabel-root.Mui-focused": {
						color: "#3AA6A4",
						},
					}}
					/>
			</Box>
		</div>
	);
}
