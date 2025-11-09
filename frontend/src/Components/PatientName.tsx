import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import "../assets/styles/globals.css"
import InputAdornment from '@mui/material/InputAdornment';

export default function PatientName() {
  return (
    <div className="patient-name-input">
        <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
        >
        <TextField 
        id="standard-basic" 
        label="Patient Name" 
        variant="standard"
        slotProps={{
            input: {
                startAdornment: (
                <InputAdornment position="start">
                    <PersonOutlineIcon></PersonOutlineIcon>
                </InputAdornment>
                ),
            },
            }}/>
        </Box>
    </div>
    
  );
}
