import { TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import * as React from "react";

export default function DateTimePickerValue() {
	const [value, setValue] = React.useState<Dayjs | null>(dayjs());

	return (
		<div className="calendar">
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				{/* Controlled Picker */}
				<DateTimePicker
					label="Date"
					value={value}
					onChange={(newValue) => setValue(newValue)}
					slotProps={{
						textField: {
							sx: {
								// DEFAULT BORDER
								"& .MuiPickersOutlinedInput-notchedOutline": {
									borderColor: "#244A82",
								},

								// HOVER BORDER
								"&:hover .MuiPickersOutlinedInput-notchedOutline": {
									borderColor: "#244A82",
								},

								// FOCUSED BORDER
								"& .MuiPickersInputBase-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline":
									{
										borderColor: "#244A82",
									},

								// FOCUSED LABEL
								"& .MuiInputLabel-root.Mui-focused": {
									color: "#3AA6A4",
								},
							},
						},
						actionBar: {
							sx: {
								"& .MuiButton-root.MuiButton-textPrimary": {
									color: "#3AA6A4",
									fontWeight: 600,
								},
							},
						},
						desktopPaper: {
							sx: {
								// SELECTED DAY
								"& .MuiPickersDay-root.Mui-selected": {
									backgroundColor: "#244A82",
									color: "white",
								},

								// SELECTED TIME (05, 40 etc)
								"& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
									backgroundColor: "#244A82",
									color: "white",
								},
							},
						},

						layout: {
							sx: {
								// AM/PM TOGGLE
								"& .MuiToggleButton-root.Mui-selected": {
									backgroundColor: "#244A82",
									color: "white",
								},
							},
						},
					}}
				/>
			</LocalizationProvider>
		</div>
	);
}
