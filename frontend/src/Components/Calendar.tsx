import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function DateTimePickerValue() {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs());

  return (
    <div className="calendar">
        <LocalizationProvider dateAdapter={AdapterDayjs} >
            <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                {/* <DateTimePicker
                label="Uncontrolled picker"
                defaultValue={dayjs('2022-04-17T15:30')}
                /> */}
                {/* Controlled Picker */}
                <DateTimePicker
                label="Date"
                value={value}
                onChange={(newValue) => setValue(newValue)}
                />
            </DemoContainer>
        </LocalizationProvider>
    </div>
  );
}