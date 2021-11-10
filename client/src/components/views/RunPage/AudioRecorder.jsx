import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
import React, {useState} from 'react'

function AudioRecorder(props) {
    const [recordState, setRecordState] = useState(null);

    const onStop = (audioData) => {
        console.log('audioData', audioData);
        console.log(audioData.url);
    }

    const start = () => {
        setRecordState(RecordState.START);
    }
    const stop = () => {
        setRecordState(RecordState.STOP);
        
    }


    return (
        <div className='audioRecord'>
            <AudioReactRecorder state={recordState} onStop={onStop}/>
            {/* <button onClick={start}>Start</button>
            <button onClick={stop}>STOP</button> */}
            
        </div>
    )
}

export default AudioRecorder;