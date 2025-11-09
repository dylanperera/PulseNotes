import StartRecordingUI from './StartRecordingUI';
import PauseUI from './PauseUI';
import ResumeUI from './ResumeUI';

type RecordingButtonProps = {
  isRecording: boolean;
  handleIsRecording: () => void;
  recordingStarted: boolean,
  handleStartRecording : () => void;
};

export default function RecordingOptions({
  isRecording,
  handleIsRecording,
  recordingStarted,
  handleStartRecording
}: RecordingButtonProps) {

  if(recordingStarted === false)
  {
    return (<StartRecordingUI handleStartRecording={handleStartRecording} handleIsRecording={handleIsRecording}/>);
  } else if (recordingStarted === true && isRecording === true) {
    return (<PauseUI handleIsRecording={handleIsRecording}/>);
  } else if (recordingStarted === true && isRecording === false) {
    return (<ResumeUI handleIsRecording={handleIsRecording}/>);
  } else {
    return <div>Error</div>
  }
}
